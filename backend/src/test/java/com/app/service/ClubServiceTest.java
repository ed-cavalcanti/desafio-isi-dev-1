package com.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

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

import com.app.api.ApiException;
import com.app.api.ClubDetailsResponse;
import com.app.api.SquadPlayerResponse;
import com.app.api.ClubRequest;
import com.app.api.ClubRequestValidator;
import com.app.api.ClubResponse;
import com.app.api.ClubSort;
import com.app.mapper.ClubMapper;
import com.app.mapper.PlayerMapper;
import com.app.model.BrasiliaTime;
import com.app.model.Condition;
import com.app.model.ContractStatus;
import com.app.model.Position;
import com.app.persistence.Clube;
import com.app.persistence.ClubeRepository;
import com.app.persistence.Contrato;
import com.app.persistence.ContratoRepository;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@ExtendWith(MockitoExtension.class)
class ClubServiceTest {

    private final ObjectMapper JSON = new ObjectMapper();
    private final ClubRequestValidator validator = new ClubRequestValidator();
    private final ClubMapper mapper = new ClubMapper();
    private final PlayerMapper playerMapper = new PlayerMapper();

    @Mock
    private ClubeRepository clubes;

    @Mock
    private JogadorRepository jogadores;

    @Mock
    private ContratoRepository contratos;

    private ClubService service;

    @BeforeEach
    void setUp() {
        service = new ClubService(validator, mapper, playerMapper, clubes, jogadores, contratos);
    }

    private ObjectNode body(String name, String acronym) {
        ObjectNode body = JSON.createObjectNode();
        body.put("name", name);
        body.put("acronym", acronym);
        return body;
    }

    private Clube club(int id, String name, String acronym) {
        Clube clube = mapper.toEntity(new ClubRequest(name, acronym));
        ReflectionTestUtils.setField(clube, "id", id);
        return clube;
    }

    private Jogador player(int id, Integer clubId, String baseValue) {
        Jogador jogador = new Jogador();
        jogador.nome("Meia Lua");
        jogador.posicao(Position.MEI);
        jogador.agilidade(50);
        jogador.idade(25);
        jogador.valorBase(new BigDecimal(baseValue));
        jogador.condicao(Condition.APTO);
        jogador.clubeId(clubId);
        jogador.velocidade(68);
        jogador.finalizacao(65);
        jogador.passe(80);
        jogador.drible(78);
        jogador.defesa(52);
        jogador.fisico(60);
        jogador.potencial(86);
        ReflectionTestUtils.setField(jogador, "id", id);
        return jogador;
    }

    @Test
    @DisplayName("cadastra clube com caixa de 300,00 e sem elenco")
    void createsClubWithInitialCash() {
        when(clubes.existsByNomeBusca("águias fc")).thenReturn(false);
        when(clubes.existsBySigla("AFC")).thenReturn(false);
        when(clubes.count()).thenReturn(0L);
        when(clubes.save(any(Clube.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ClubResponse response = service.create(body("  Águias   FC ", "AFC"));

        assertThat(response.name()).isEqualTo("Águias FC");
        assertThat(response.acronym()).isEqualTo("AFC");
        assertThat(response.cash()).isEqualByComparingTo("300.00");
        assertThat(response.squadValue()).isEqualByComparingTo("0.00");
        assertThat(response.netWorth()).isEqualByComparingTo("300.00");
    }

    @Test
    @DisplayName("recusa nome repetido ignorando maiúsculas e minúsculas")
    void rejectsDuplicateNameIgnoringCase() {
        when(clubes.existsByNomeBusca("águias fc")).thenReturn(true);

        ApiException exception = assertThrows(ApiException.class, () -> service.create(body("ÁGUIAS FC", "AFC")));

        assertThat(exception.status()).isEqualTo(409);
    }

    @Test
    @DisplayName("recusa sigla repetida e o 21º clube")
    void rejectsDuplicateAcronymAndTwentyFirstClub() {
        when(clubes.existsByNomeBusca("clube novo")).thenReturn(false);
        when(clubes.existsBySigla("CNO")).thenReturn(true);
        ApiException duplicateAcronym = assertThrows(ApiException.class,
                () -> service.create(body("Clube Novo", "CNO")));
        assertThat(duplicateAcronym.status()).isEqualTo(409);

        when(clubes.existsBySigla("CNO")).thenReturn(false);
        when(clubes.count()).thenReturn(20L);
        ApiException tooManyClubs = assertThrows(ApiException.class, () -> service.create(body("Clube Novo", "CNO")));
        assertThat(tooManyClubs.status()).isEqualTo(409);
    }

    @Test
    @DisplayName("lista por nome e por patrimônio com empate desfeito pelo nome")
    void listsClubsSortedByNameAndNetWorth() {
        when(clubes.findAll()).thenReturn(List.of(club(1, "Beta FC", "BFC"), club(2, "Alfa FC", "AFC")));
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of(
                player(10, 1, "40.00"),
                player(11, 2, "30.00"),
                player(12, null, "99.00")));

        assertThat(service.list(ClubSort.NAME)).extracting(ClubResponse::name)
                .containsExactly("Alfa FC", "Beta FC");

        assertThat(service.list(ClubSort.NET_WORTH_DESC)).extracting(ClubResponse::name)
                .containsExactly("Beta FC", "Alfa FC");

        assertThat(service.list(ClubSort.NET_WORTH_ASC)).extracting(ClubResponse::name)
                .containsExactly("Alfa FC", "Beta FC");
    }

    @Test
    @DisplayName("calcula o valor do elenco e o patrimônio a cada consulta")
    void calculatesSquadValueAndNetWorth() {
        when(clubes.findAll()).thenReturn(List.of(club(1, "Alfa FC", "AFC")));
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of(
                player(10, 1, "30.00"),
                player(11, 1, "40.00")));

        ClubResponse response = service.list(ClubSort.NAME).get(0);

        assertThat(response.squadValue()).isEqualByComparingTo("70.00");
        assertThat(response.netWorth()).isEqualByComparingTo("370.00");
    }

    @Test
    @DisplayName("empate de patrimônio é desfeito pelo nome e depois pelo id")
    void breaksNetWorthTiesByNameAndId() {
        when(clubes.findAll()).thenReturn(List.of(
                club(2, "Aguias FC", "AFC"),
                club(1, "Águias FC", "AGU")));
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of());

        assertThat(service.list(ClubSort.NET_WORTH_DESC)).extracting(ClubResponse::id)
                .containsExactly(1, 2);
    }

    private Jogador squadPlayer(int id, String name, Position position, Integer clubId, String baseValue) {
        Jogador jogador = player(id, clubId, baseValue);
        jogador.nome(name);
        jogador.posicao(position);
        return jogador;
    }

    @Test
    @DisplayName("consulta o clube com o elenco ordenado, os contratos e os valores calculados")
    void getsClubWithSquadAndContracts() {
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "Águias FC", "AFC")));
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of(
                squadPlayer(5, "Otto Rangel", Position.ATA, 1, "40.00"),
                squadPlayer(1, "Rui Prado", Position.GOL, 1, "20.00"),
                squadPlayer(2, "Téo Brandão", Position.ZAG, 1, "30.00"),
                squadPlayer(9, "Livre Qualquer", Position.MEI, null, "99.00")));
        when(contratos.findByJogadorIdAndStatus(1, ContractStatus.ATIVO))
                .thenReturn(Optional.of(new Contrato(1, 1, new BigDecimal("20.00"),
                        BrasiliaTime.now().plusDays(30).minusHours(12), ContractStatus.ATIVO, BrasiliaTime.now())));
        when(contratos.findByJogadorIdAndStatus(2, ContractStatus.ATIVO))
                .thenReturn(Optional.of(new Contrato(2, 1, new BigDecimal("30.00"),
                        BrasiliaTime.now().plusDays(200), ContractStatus.ATIVO, BrasiliaTime.now())));
        when(contratos.findByJogadorIdAndStatus(5, ContractStatus.ATIVO))
                .thenReturn(Optional.of(new Contrato(5, 1, new BigDecimal("40.00"),
                        BrasiliaTime.now().plusDays(200), ContractStatus.ATIVO, BrasiliaTime.now())));

        ClubDetailsResponse response = service.get("1");

        assertThat(response.name()).isEqualTo("Águias FC");
        assertThat(response.cash()).isEqualByComparingTo("300.00");
        assertThat(response.squadValue()).isEqualByComparingTo("90.00");
        assertThat(response.netWorth()).isEqualByComparingTo("390.00");
        assertThat(response.players()).extracting(SquadPlayerResponse::id)
                .containsExactly(1, 2, 5);
        assertThat(response.players().get(0).contract().remainingDays()).isEqualTo(30);
        assertThat(response.players().get(0).contract().penaltyRate()).isEqualTo(5);
        assertThat(response.players().get(0).contract().loyaltyUntil())
                .matches("\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}-03:00");
        assertThat(response.players().get(1).contract().penaltyRate()).isEqualTo(20);
    }

    @Test
    @DisplayName("sem elenco devolve lista vazia e ids inválidos ou inexistentes respondem 404")
    void getsEmptySquadAndNotFound() {
        when(clubes.findById(1)).thenReturn(Optional.of(club(1, "Águias FC", "AFC")));
        when(jogadores.findByExcluidoEmIsNull()).thenReturn(List.of());

        ClubDetailsResponse response = service.get("1");

        assertThat(response.players()).isEmpty();
        assertThat(response.squadValue()).isEqualByComparingTo("0.00");
        assertThat(response.netWorth()).isEqualByComparingTo("300.00");

        when(clubes.findById(99)).thenReturn(Optional.empty());
        assertThat(assertThrows(ApiException.class, () -> service.get("99")).status()).isEqualTo(404);
        assertThat(assertThrows(ApiException.class, () -> service.get("abc")).status()).isEqualTo(404);
    }
}
