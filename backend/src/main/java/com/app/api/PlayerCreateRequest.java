package com.app.api;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Contrato do corpo de entrada de POST /players. Serve de esquema para a documentação:
 * os campos calculados pela API (id, base_value, overall, market_value, condition e
 * club_id) e campos de outros endpoints são ignorados (V7) e por isso não fazem parte.
 */
@Schema(description = "Cadastro de jogador")
public record PlayerCreateRequest(

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Nome do jogador, com pelo menos duas palavras e nenhum dígito", example = "Fulano DeTal", minLength = 3, maxLength = 100)
        String name,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Posição em campo", example = "MEI", allowableValues = {"GOL", "ZAG", "LAT", "MEI", "ATA"})
        String position,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Agilidade; com 35 anos ou mais, no máximo 85", example = "85", minimum = "1", maximum = "100")
        Integer agility,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Idade", example = "25", minimum = "16", maximum = "45")
        Integer age,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Velocidade; os seis atributos somam no máximo 480", example = "70", minimum = "1", maximum = "99")
        Integer pace,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Finalização", example = "68", minimum = "1", maximum = "99")
        Integer shooting,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Passe", example = "82", minimum = "1", maximum = "99")
        Integer passing,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Drible", example = "79", minimum = "1", maximum = "99")
        Integer dribbling,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Defesa", example = "55", minimum = "1", maximum = "99")
        Integer defending,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Físico", example = "64", minimum = "1", maximum = "99")
        Integer physical,

        @Schema(requiredMode = Schema.RequiredMode.REQUIRED, description = "Potencial, maior ou igual ao maior dos seis atributos; com 33 anos ou mais, igual a ele", example = "86", minimum = "1", maximum = "99")
        Integer potential) {
}
