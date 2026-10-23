package com.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.app.api.ApiException;
import com.app.api.PlayerListQuery;
import com.app.api.PlayerPageResponse;
import com.app.api.PlayerRequestValidator;
import com.app.api.PlayerResponse;
import com.app.api.PlayerSort;
import com.app.mapper.PlayerMapper;
import com.app.model.Condition;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class PlayerServiceTest {

    private final ObjectMapper JSON = new ObjectMapper();
    private final PlayerRequestValidator validator = new PlayerRequestValidator();
    private final PlayerMapper mapper = new PlayerMapper();

    @Mock
    private ClubeRepository clubes;

    @Mock
    private JogadorRepository jogadores;

    private PlayerService service;

    @BeforeEach
    void setUp() {
        service = new PlayerService(validator, mapper, clubes, jogadores);
    }

    private ObjectNode body(int age, int potential) {
        ObjectNode body = JSON.createObjectNode();
        body.put("name", "Meia Lua");
        body.put("position", "MEI");
        body.put("agility", 50);
        body.put("age", age);
        body.put("pace", 68);
        body.put("shooting", 65);
        body.put("passing", 80);
        body.put("dribbling", 78);
        body.put("defending", 52);
        body.put("physical", 60);
        body.put("potential", potential);
        return body;
    }

    private Jogador player(int id, String name) {
        return player(id, name, "MEI", 50, 25, Condition.APTO, null, new BigDecimal("36.00"));
    }

    private Jogador player(int id, String name, String position, int agility, int age, Condition condition,
            Integer clubId, BigDecimal baseValue) {
        ObjectNode body = body(age, age >= 33 ? 80 : 86);
        body.put("name", name);
        body.put("position", position);
        body.put("agility", agility);
        Jogador jogador = mapper.toEntity(validator.create(body), baseValue);
        ReflectionTestUtils.setField(jogador, "id", id);
        jogador.condicao(condition);
        jogador.clubeId(clubId);
        return jogador;
    }

    private PlayerListQuery query(int page, int limit) {
        return new PlayerListQuery(null, null, null, null, null, 16, 45, BigDecimal.ZERO,
                new BigDecimal("550"), List.of(PlayerSort.NAME), page, limit);
    }

    @Test
    @DisplayName("calcula overall, valor base e valor de mercado ao cadastrar")
    void createsPlayerWithCalculatedValues() {
        when(jogadores.save(any(Jogador.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PlayerResponse response = service.create(body(25, 86));

        assertThat(response.overall()).isEqualTo(73);
        assertThat(response.baseValue()).isEqualByComparingTo("36.00");
        assertThat(response.marketValue()).isEqualByComparingTo("36.00");
        assertThat(response.condition()).isEqualTo("APTO");
        assertThat(response.clubId()).isNull();
    }

    @Test
    @DisplayName("aplica o jovem promessa e o ajuste por idade")
    void appliesYoungPromiseAndAgeAdjustment() {
        when(jogadores.save(any(Jogador.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PlayerResponse response = service.create(body(21, 84));

        assertThat(response.baseValue()).isEqualByComparingTo("39.96");
        assertThat(response.marketValue()).isEqualByComparingTo("43.96");
    }

    @Test
    @DisplayName("lista paginada ordena por nome ignorando acentos e devolve os metadados")
    void listsPlayersPaginatedAndOrderedByName() {
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of(
                player(3, "Épsilon EC"),
                player(2, "Delta FC"),
                player(1, "Ana Lima")));

        PlayerPageResponse firstPage = service.list(query(1, 2));

        assertThat(firstPage.data()).extracting(PlayerResponse::name)
                .containsExactly("Ana Lima", "Delta FC");
        assertThat(firstPage.meta().page()).isEqualTo(1);
        assertThat(firstPage.meta().limit()).isEqualTo(2);
        assertThat(firstPage.meta().totalItems()).isEqualTo(3);
        assertThat(firstPage.meta().totalPages()).isEqualTo(2);

        PlayerPageResponse secondPage = service.list(query(2, 2));

        assertThat(secondPage.data()).extracting(PlayerResponse::name)
                .containsExactly("Épsilon EC");
    }

    @Test
    @DisplayName("pagina alem da ultima devolve data vazia com os metadados corretos")
    void returnsEmptyDataBeyondLastPage() {
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of(player(1, "Ana Lima")));

        PlayerPageResponse response = service.list(query(4, 10));

        assertThat(response.data()).isEmpty();
        assertThat(response.meta().totalItems()).isEqualTo(1);
        assertThat(response.meta().totalPages()).isEqualTo(1);
    }

    @Test
    @DisplayName("sem jogadores, total_pages e zero")
    void returnsZeroPagesWhenThereAreNoPlayers() {
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of());

        PlayerPageResponse response = service.list(query(1, 10));

        assertThat(response.data()).isEmpty();
        assertThat(response.meta().totalItems()).isZero();
        assertThat(response.meta().totalPages()).isZero();
    }

    @Test
    @DisplayName("busca ignora maiusculas e acentos e combina com os outros filtros")
    void filtersBySearchAndOtherCriteria() {
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of(
                player(1, "João Silva"),
                player(2, "Ana Maria", "ATA", 50, 30, Condition.MAL_CONDICIONADO, 1,
                        new BigDecimal("36.00")),
                player(3, "João Pedro", "ZAG", 50, 40, Condition.DOENTE, 1,
                        new BigDecimal("36.00"))));
        when(clubes.existsById(1)).thenReturn(true);

        PlayerListQuery search = new PlayerListQuery("JOAO", null, null, null, null, 16, 45,
                BigDecimal.ZERO, new BigDecimal("550"), List.of(PlayerSort.NAME), 1, 10);
        assertThat(service.list(search).data()).extracting(PlayerResponse::name)
                .containsExactly("João Pedro", "João Silva");

        PlayerListQuery combined = new PlayerListQuery(null,
                com.app.model.Position.ZAG, Condition.DOENTE, false, 1, 16, 45,
                BigDecimal.ZERO, new BigDecimal("550"), List.of(PlayerSort.NAME), 1, 10);
        assertThat(service.list(combined).data()).extracting(PlayerResponse::id)
                .containsExactly(3);
    }

    @Test
    @DisplayName("filtra por livres, faixa de idade e faixa de valor de mercado")
    void filtersByFreeAgeAndMarketValue() {
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of(
                player(1, "Ana Lima", "MEI", 50, 20, Condition.APTO, null,
                        new BigDecimal("36.00")),
                player(2, "Beto Souza", "MEI", 50, 25, Condition.MAL_CONDICIONADO, 1,
                        new BigDecimal("36.00")),
                player(3, "Caio Reis", "MEI", 50, 30, Condition.DOENTE, 1,
                        new BigDecimal("36.00"))));

        PlayerListQuery free = new PlayerListQuery(null, null, null, true, null, 16, 45,
                BigDecimal.ZERO, new BigDecimal("550"), List.of(PlayerSort.NAME), 1, 10);
        assertThat(service.list(free).data()).extracting(PlayerResponse::id)
                .containsExactly(1);

        PlayerListQuery ageAndValue = new PlayerListQuery(null, null, null, null, null, 24, 26,
                new BigDecimal("30"), new BigDecimal("31"), List.of(PlayerSort.NAME), 1, 10);
        assertThat(service.list(ageAndValue).data()).extracting(PlayerResponse::id)
                .containsExactly(2);
    }

    @Test
    @DisplayName("ordena pelo valor de mercado e pela idade")
    void sortsByValueAndAge() {
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of(
                player(1, "Ana Lima", "MEI", 50, 30, Condition.APTO, null,
                        new BigDecimal("20.00")),
                player(2, "Beto Souza", "MEI", 50, 20, Condition.APTO, null,
                        new BigDecimal("40.00")),
                player(3, "Caio Reis", "MEI", 50, 25, Condition.APTO, null,
                        new BigDecimal("30.00"))));

        PlayerListQuery valueDesc = new PlayerListQuery(null, null, null, null, null, 16, 45,
                BigDecimal.ZERO, new BigDecimal("550"), List.of(PlayerSort.VALUE_DESC), 1, 10);
        assertThat(service.list(valueDesc).data()).extracting(PlayerResponse::id)
                .containsExactly(2, 3, 1);

        PlayerListQuery ageAsc = new PlayerListQuery(null, null, null, null, null, 16, 45,
                BigDecimal.ZERO, new BigDecimal("550"), List.of(PlayerSort.AGE_ASC), 1, 10);
        assertThat(service.list(ageAsc).data()).extracting(PlayerResponse::id)
                .containsExactly(2, 3, 1);
    }

    @Test
    @DisplayName("filtro por clube inexistente responde 404")
    void rejectsUnknownClub() {
        when(clubes.existsById(99)).thenReturn(false);

        PlayerListQuery query = new PlayerListQuery(null, null, null, false, 99, 16, 45,
                BigDecimal.ZERO, new BigDecimal("550"), List.of(PlayerSort.NAME), 1, 10);

        ApiException exception = assertThrows(ApiException.class, () -> service.list(query));

        assertThat(exception.status()).isEqualTo(404);
    }

    @Test
    @DisplayName("consulta jogador existente e trata ids invalidos ou inexistentes")
    void getsPlayerById() {
        when(jogadores.findByIdAndExcluidoEmIsNull(1)).thenReturn(Optional.of(player(1, "Ana Lima")));

        assertThat(service.get("1").name()).isEqualTo("Ana Lima");
        assertThat(assertThrows(ApiException.class, () -> service.get("2")).status()).isEqualTo(404);
        assertThat(assertThrows(ApiException.class, () -> service.get("01")).status()).isEqualTo(404);
        assertThat(assertThrows(ApiException.class, () -> service.get("abc")).status()).isEqualTo(404);
        assertThat(assertThrows(ApiException.class, () -> service.get("2147483648")).status()).isEqualTo(404);
    }
}
