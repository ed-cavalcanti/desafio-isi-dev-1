package com.app.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class PlayerCalculatorTest {

    @Nested
    @DisplayName("RN06 - overall")
    class Overall {

        @Test
        void calculatesWeightedAverageForMeia() {
            PlayerAttributes attributes = new PlayerAttributes(68, 65, 80, 78, 52, 60, 85);

            assertThat(PlayerCalculator.overall(Position.MEI, attributes)).isEqualTo(73);
        }

        @Test
        void calculatesWeightedAverageForAta() {
            PlayerAttributes attributes = new PlayerAttributes(78, 75, 73, 82, 48, 68, 88);

            assertThat(PlayerCalculator.overall(Position.ATA, attributes)).isEqualTo(76);
        }

        @Test
        void calculatesWeightedAverageForLat() {
            PlayerAttributes attributes = new PlayerAttributes(72, 70, 78, 76, 70, 66, 90);

            assertThat(PlayerCalculator.overall(Position.LAT, attributes)).isEqualTo(72);
        }

        @Test
        void roundsHalfUpForZag() {
            PlayerAttributes attributes = new PlayerAttributes(50, 90, 60, 40, 80, 75, 90);

            assertThat(PlayerCalculator.overall(Position.ZAG, attributes)).isEqualTo(73);
        }

        @Test
        void calculatesWeightedAverageForGol() {
            PlayerAttributes attributes = new PlayerAttributes(55, 30, 65, 40, 72, 68, 80);

            assertThat(PlayerCalculator.overall(Position.GOL, attributes)).isEqualTo(68);
        }
    }

    @Nested
    @DisplayName("RN06 - valor base")
    class BaseValue {

        @ParameterizedTest(name = "overall {0}, potential {1}, age {2} -> {3}")
        @CsvSource({
                "75, 86, 25, 40.00",
                "60, 70, 30, 10.00",
                "61, 70, 30, 12.00",
                "76, 80, 22, 46.00",
                "85, 92, 27, 100.00",
                "70, 84, 21, 34.20",
                "70, 84, 22, 30.00",
                "45, 90, 18, 3.63",
                "40, 66, 36, 1.00"
        })
        void calculatesBaseValue(int overall, int potential, int age, String expected) {
            BigDecimal baseValue = PlayerCalculator.baseValue(overall, age, potential);

            assertThat(baseValue).isEqualByComparingTo(expected);
        }
    }

    @Nested
    @DisplayName("RN02 a RN05 - valor de mercado")
    class MarketValue {

        @ParameterizedTest(name = "base {0}, {1}, agility {2}, age {3} -> {4}")
        @CsvSource({
                "82.00, APTO, 20, 25, 82.00",
                "82.00, APTO, 50, 19, 90.20",
                "82.00, MAL_CONDICIONADO, 50, 25, 69.70",
                "82.00, MAL_CONDICIONADO, 80, 21, 84.05",
                "82.00, MAL_CONDICIONADO, 30, 33, 53.30",
                "82.00, DOENTE, 90, 25, 69.70",
                "82.00, DOENTE, 30, 25, 49.20",
                "82.00, DOENTE, 10, 40, 49.20",
                "9.50, MAL_CONDICIONADO, 85, 25, 8.79",
                "1.00, MAL_CONDICIONADO, 50, 35, 1.00"
        })
        void calculatesMarketValue(String baseValue, Condition condition, int agility, int age, String expected) {
            BigDecimal marketValue = PlayerCalculator.marketValue(condition, age, agility, new BigDecimal(baseValue));

            assertThat(marketValue).isEqualByComparingTo(expected);
        }
    }
}
