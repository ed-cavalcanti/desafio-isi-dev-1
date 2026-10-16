package com.app.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.app.api.PlayerRequestValidator;
import com.app.api.PlayerResponse;
import com.app.mapper.PlayerMapper;
import com.app.persistence.Jogador;
import com.app.persistence.JogadorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
        when(jogadores.save(any(Jogador.class))).thenAnswer(invocation -> invocation.getArgument(0));
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
        PlayerResponse response = service.create(meiBody(21, 84));

        assertThat(response.baseValue()).isEqualByComparingTo("39.96");
        assertThat(response.marketValue()).isEqualByComparingTo("43.96");
    }
}
