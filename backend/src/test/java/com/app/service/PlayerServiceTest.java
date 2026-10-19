package com.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.app.api.PlayerListQuery;
import com.app.api.PlayerPageResponse;
import com.app.api.PlayerRequestValidator;
import com.app.api.PlayerResponse;
import com.app.mapper.PlayerMapper;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.math.BigDecimal;
import java.util.List;
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
    private JogadorRepository jogadores;

    private PlayerService service;

    @BeforeEach
    void setUp() {
        service = new PlayerService(validator, mapper, jogadores);
    }

    private ObjectNode meiBody(int age, int potential) {
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

    @Test
    @DisplayName("calcula overall, valor base e valor de mercado ao cadastrar")
    void createsPlayerWithCalculatedValues() {
        when(jogadores.save(any(Jogador.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PlayerResponse response = service.create(meiBody(25, 86));

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

        PlayerResponse response = service.create(meiBody(21, 84));

        assertThat(response.baseValue()).isEqualByComparingTo("39.96");
        assertThat(response.marketValue()).isEqualByComparingTo("43.96");
    }

    private Jogador player(int id, String name) {
        ObjectNode body = meiBody(25, 86);
        body.put("name", name);
        Jogador jogador = mapper.toEntity(validator.create(body), new BigDecimal("36.00"));
        ReflectionTestUtils.setField(jogador, "id", id);
        return jogador;
    }

    @Test
    @DisplayName("lista paginada ordena por nome ignorando acentos e devolve os metadados")
    void listsPlayersPaginatedAndOrderedByName() {
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of(
                player(3, "Épsilon EC"),
                player(2, "Delta FC"),
                player(1, "Ana Lima")));

        PlayerPageResponse firstPage = service.list(new PlayerListQuery(1, 2));

        assertThat(firstPage.data()).extracting(PlayerResponse::name)
                .containsExactly("Ana Lima", "Delta FC");
        assertThat(firstPage.meta().page()).isEqualTo(1);
        assertThat(firstPage.meta().limit()).isEqualTo(2);
        assertThat(firstPage.meta().totalItems()).isEqualTo(3);
        assertThat(firstPage.meta().totalPages()).isEqualTo(2);

        PlayerPageResponse secondPage = service.list(new PlayerListQuery(2, 2));

        assertThat(secondPage.data()).extracting(PlayerResponse::name)
                .containsExactly("Épsilon EC");
    }

    @Test
    @DisplayName("pagina alem da ultima devolve data vazia com os metadados corretos")
    void returnsEmptyDataBeyondLastPage() {
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of(player(1, "Ana Lima")));

        PlayerPageResponse response = service.list(new PlayerListQuery(4, 10));

        assertThat(response.data()).isEmpty();
        assertThat(response.meta().totalItems()).isEqualTo(1);
        assertThat(response.meta().totalPages()).isEqualTo(1);
    }

    @Test
    @DisplayName("sem jogadores, total_pages e zero")
    void returnsZeroPagesWhenThereAreNoPlayers() {
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of());

        PlayerPageResponse response = service.list(new PlayerListQuery(1, 10));

        assertThat(response.data()).isEmpty();
        assertThat(response.meta().totalItems()).isZero();
        assertThat(response.meta().totalPages()).isZero();
    }
}
