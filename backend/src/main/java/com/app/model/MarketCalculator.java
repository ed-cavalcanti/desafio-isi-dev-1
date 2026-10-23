package com.app.model;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Regras de cálculo do mercado (RN13, RN15 e RN16): taxa de compra, dias e
 * multa de fidelidade e comissão progressiva de venda. Valores em moedas são
 * arredondados uma única vez, no resultado final, para 2 casas e para longe do
 * zero.
 */
public final class MarketCalculator {

    private static final BigDecimal HUNDRED = new BigDecimal(100);
    private static final BigDecimal FEE_PERCENT = new BigDecimal("5");
    private static final BigDecimal FEE_THRESHOLD = new BigDecimal("30.00");
    private static final BigDecimal PENALTY_CAP = new BigDecimal("10.00");
    private static final BigDecimal COMMISSION_FIRST_STEP = new BigDecimal("10.00");
    private static final BigDecimal COMMISSION_FIRST_PERCENT = new BigDecimal("10");
    private static final BigDecimal COMMISSION_SECOND_PERCENT = new BigDecimal("20");
    private static final BigDecimal ZERO = BigDecimal.ZERO.setScale(2);
    private static final long NANOS_PER_DAY = 86_400_000_000_000L;
    private static final int DIVISION_SCALE = 8;
    private static final int MONEY_SCALE = 2;

    private MarketCalculator() {
    }

    /**
     * RN13: taxa de 5% do valor de mercado, arredondada, cobrada somente quando
     * o valor de mercado é maior que 30,00.
     */
    public static BigDecimal purchaseFee(BigDecimal marketValue) {
        if (marketValue.compareTo(FEE_THRESHOLD) <= 0) {
            return ZERO;
        }
        return percent(marketValue, FEE_PERCENT);
    }

    /**
     * RN15.1: dias restantes de fidelidade em dias com fração, arredondado para
     * cima; se o fim já passou ou é o próprio momento, 0.
     */
    public static int daysRemaining(LocalDateTime loyaltyUntil, LocalDateTime moment) {
        long nanos = ChronoUnit.NANOS.between(moment, loyaltyUntil);
        if (nanos <= 0) {
            return 0;
        }
        return (int) ((nanos + NANOS_PER_DAY - 1) / NANOS_PER_DAY);
    }

    /**
     * RN15.2: percentual da multa pelos dias restantes.
     */
    public static int penaltyPercent(int daysRemaining) {
        if (daysRemaining == 0) {
            return 0;
        }
        if (daysRemaining <= 30) {
            return 5;
        }
        if (daysRemaining <= 180) {
            return 10;
        }
        return 20;
    }

    /**
     * RN15.3: multa de valor de mercado × percentual, arredondada e limitada a
     * 10,00.
     */
    public static BigDecimal penalty(BigDecimal marketValue, int percent) {
        if (percent == 0) {
            return ZERO;
        }
        return percent(marketValue, BigDecimal.valueOf(percent)).min(PENALTY_CAP);
    }

    /**
     * RN16.3: comissão progressiva sobre o lucro, somente quando o lucro é
     * maior que zero: 10% da parte até 10,00 e 20% da parte acima, somadas e
     * arredondadas uma única vez.
     */
    public static BigDecimal commission(BigDecimal profit) {
        if (profit.signum() <= 0) {
            return ZERO;
        }
        BigDecimal firstStep = profit.min(COMMISSION_FIRST_STEP);
        BigDecimal secondStep = profit.subtract(firstStep);
        BigDecimal total = firstStep.multiply(COMMISSION_FIRST_PERCENT)
                .add(secondStep.multiply(COMMISSION_SECOND_PERCENT));
        return total.divide(HUNDRED, DIVISION_SCALE, RoundingMode.HALF_UP).setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private static BigDecimal percent(BigDecimal value, BigDecimal percent) {
        return value.multiply(percent)
                .divide(HUNDRED, DIVISION_SCALE, RoundingMode.HALF_UP)
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }
}
