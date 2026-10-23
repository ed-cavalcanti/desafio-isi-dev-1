package com.app.model;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

class MarketCalculatorTest {

    private static final LocalDateTime MOMENT = LocalDateTime.of(2027, 1, 1, 10, 0);

    @Nested
    @DisplayName("RN13 – taxa de compra")
    class PurchaseFee {

        @Test
        @DisplayName("não cobra taxa até 30,00 e cobra 5% acima, arredondada")
        void calculatesFee() {
            assertThat(MarketCalculator.purchaseFee(new BigDecimal("28.00"))).isEqualByComparingTo("0.00");
            assertThat(MarketCalculator.purchaseFee(new BigDecimal("30.00"))).isEqualByComparingTo("0.00");
            assertThat(MarketCalculator.purchaseFee(new BigDecimal("30.01"))).isEqualByComparingTo("1.50");
            assertThat(MarketCalculator.purchaseFee(new BigDecimal("47.62"))).isEqualByComparingTo("2.38");
            assertThat(MarketCalculator.purchaseFee(new BigDecimal("48.00"))).isEqualByComparingTo("2.40");
        }
    }

    @Nested
    @DisplayName("RN15 – fidelidade e multa")
    class Loyalty {

        @Test
        @DisplayName("dias restantes arredonda para cima e não fica negativo")
        void calculatesDaysRemaining() {
            assertThat(MarketCalculator.daysRemaining(MOMENT.minusDays(30), MOMENT)).isZero();
            assertThat(MarketCalculator.daysRemaining(MOMENT, MOMENT)).isZero();
            assertThat(MarketCalculator.daysRemaining(MOMENT.plusDays(10).plusHours(2), MOMENT)).isEqualTo(11);
            assertThat(MarketCalculator.daysRemaining(MOMENT.plusDays(30), MOMENT)).isEqualTo(30);
            assertThat(MarketCalculator.daysRemaining(MOMENT.plusDays(30).plusMinutes(1), MOMENT)).isEqualTo(31);
            assertThat(MarketCalculator.daysRemaining(MOMENT.plusDays(180), MOMENT)).isEqualTo(180);
            assertThat(MarketCalculator.daysRemaining(MOMENT.plusDays(180).plusMinutes(1), MOMENT)).isEqualTo(181);
            assertThat(MarketCalculator.daysRemaining(MOMENT.plusDays(200), MOMENT)).isEqualTo(200);
            assertThat(MarketCalculator.daysRemaining(MOMENT.plusDays(116).plusHours(17).plusMinutes(35), MOMENT))
                    .isEqualTo(117);
        }

        @Test
        @DisplayName("percentual da multa pelas faixas de dias restantes")
        void calculatesPenaltyPercent() {
            assertThat(MarketCalculator.penaltyPercent(0)).isZero();
            assertThat(MarketCalculator.penaltyPercent(1)).isEqualTo(5);
            assertThat(MarketCalculator.penaltyPercent(30)).isEqualTo(5);
            assertThat(MarketCalculator.penaltyPercent(31)).isEqualTo(10);
            assertThat(MarketCalculator.penaltyPercent(180)).isEqualTo(10);
            assertThat(MarketCalculator.penaltyPercent(181)).isEqualTo(20);
            assertThat(MarketCalculator.penaltyPercent(200)).isEqualTo(20);
        }

        @Test
        @DisplayName("multa é o percentual do valor de mercado, arredondada e limitada a 10,00")
        void calculatesPenalty() {
            assertThat(MarketCalculator.penalty(new BigDecimal("40.00"), 10)).isEqualByComparingTo("4.00");
            assertThat(MarketCalculator.penalty(new BigDecimal("42.50"), 20)).isEqualByComparingTo("8.50");
            assertThat(MarketCalculator.penalty(new BigDecimal("30.00"), 5)).isEqualByComparingTo("1.50");
            assertThat(MarketCalculator.penalty(new BigDecimal("75.00"), 20)).isEqualByComparingTo("10.00");
            assertThat(MarketCalculator.penalty(new BigDecimal("40.00"), 0)).isEqualByComparingTo("0.00");
        }
    }

    @Nested
    @DisplayName("RN16 – comissão progressiva")
    class Commission {

        @Test
        @DisplayName("10% até 10,00 de lucro e 20% acima, com um único arredondamento")
        void calculatesCommission() {
            assertThat(MarketCalculator.commission(new BigDecimal("3.00"))).isEqualByComparingTo("0.30");
            assertThat(MarketCalculator.commission(new BigDecimal("3.85"))).isEqualByComparingTo("0.39");
            assertThat(MarketCalculator.commission(new BigDecimal("10.00"))).isEqualByComparingTo("1.00");
            assertThat(MarketCalculator.commission(new BigDecimal("10.01"))).isEqualByComparingTo("1.00");
            assertThat(MarketCalculator.commission(new BigDecimal("15.00"))).isEqualByComparingTo("2.00");
            assertThat(MarketCalculator.commission(new BigDecimal("-7.50"))).isEqualByComparingTo("0.00");
        }
    }
}
