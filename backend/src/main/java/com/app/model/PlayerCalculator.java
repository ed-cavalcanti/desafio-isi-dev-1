package com.app.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Regras de cálculo sobre os jogadores, overall (RN06), valor base (RN06) e valor de
 * mercado (RN02 a RN05). Cálculos arredondados uma única vez, no resultado final,
 * e valores em moedas usam 2 casas, arredondadas para longe do zero.
 */
public final class PlayerCalculator {

    private static final BigDecimal HUNDRED = new BigDecimal(100);
    private static final BigDecimal TWO = new BigDecimal(2);
    private static final BigDecimal TEN_PERCENT = new BigDecimal(10);
    private static final BigDecimal MINUS_TEN_PERCENT = new BigDecimal(-10);
    private static final BigDecimal MIN_DISCOUNT_PERCENT = new BigDecimal(-40);
    private static final BigDecimal MONEY_FLOOR = new BigDecimal("1.00");
    private static final int MONEY_SCALE = 2;
    private static final int DIVISION_SCALE = 8;

    private PlayerCalculator() {
    }

    /**
     * RN06: soma ponderada dos atributos pelo peso da posição, dividida por 100,
     * arredondada para o inteiro mais próximo com meio para cima.
     */
    public static int overall(Position position, PlayerAttributes attributes) {
        int value = attributes.pace() * position.weight(Attribute.PACE);
        value += attributes.shooting() * position.weight(Attribute.SHOOTING);
        value += attributes.passing() * position.weight(Attribute.PASSING);
        value += attributes.dribbling() * position.weight(Attribute.DRIBBLING);
        value += attributes.defending() * position.weight(Attribute.DEFENDING);
        value += attributes.physical() * position.weight(Attribute.PHYSICAL);
        return (value + 50) / 100;
    }

    /**
     * RN06: parte do overall nas faixas progressivas, com o multiplicador de jovem
     * promessa para idade de até 21 anos, arredondado para 2 casas e com piso 1,00.
     */
    public static BigDecimal baseValue(int overall, int age, int potential) {
        BigDecimal overallPart = BigDecimal.valueOf(overallPartCentavos(overall), MONEY_SCALE);
        if (age <= 21) {
            BigDecimal promiseFactor = new BigDecimal(100 + potential - overall);
            overallPart = overallPart.multiply(promiseFactor).divide(HUNDRED, DIVISION_SCALE, RoundingMode.HALF_UP);
        }
        BigDecimal baseValue = overallPart.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        if (baseValue.compareTo(MONEY_FLOOR) < 0) {
            baseValue = MONEY_FLOOR;
        }
        return baseValue;
    }

    /**
     * RN05: percentual total = ajuste por idade (RN04) − desconto por condição (RN02 e
     * RN03), com teto de desconto de −40%, aplicado ao valor base.
     */
    public static BigDecimal marketValue(Condition condition, int age, int agility, BigDecimal baseValue) {
        BigDecimal conditionDiscount = condition.discountPercent();
        if (condition != Condition.APTO) {
            if (agility >= 80) {
                conditionDiscount = conditionDiscount.divide(TWO, DIVISION_SCALE, RoundingMode.HALF_UP);
            } else if (agility <= 30) {
                conditionDiscount = conditionDiscount.add(TEN_PERCENT);
            }
        }
        BigDecimal totalPercent = ageAdjust(age).subtract(conditionDiscount);
        if (totalPercent.compareTo(MIN_DISCOUNT_PERCENT) < 0) {
            totalPercent = MIN_DISCOUNT_PERCENT;
        }
        BigDecimal marketValue = baseValue.multiply(HUNDRED.add(totalPercent))
                .divide(HUNDRED, DIVISION_SCALE, RoundingMode.HALF_UP)
                .setScale(MONEY_SCALE, RoundingMode.HALF_UP);
        if (marketValue.compareTo(MONEY_FLOOR) < 0) {
            marketValue = MONEY_FLOOR;
        }
        return marketValue;
    }

    /**
     * RN06: parte do overall em centavos, pelas faixas 41-60 (0,50/ponto), 61-75
     * (2,00/ponto) e 76-99 (6,00/ponto).
     */
    private static int overallPartCentavos(int overall) {
        int points = 0;
        if (overall > 40) {
            points += (Math.min(overall, 60) - 40) * 50;
        }
        if (overall > 60) {
            points += (Math.min(overall, 75) - 60) * 200;
        }
        if (overall > 75) {
            points += (overall - 75) * 600;
        }
        return points;
    }

    /**
     * RN04: +10 pontos percentuais até 21 anos, 0% de 22 a 31 e −10% de 32 anos em diante.
     */
    private static BigDecimal ageAdjust(int age) {
        if (age <= 21) {
            return TEN_PERCENT;
        }
        if (age <= 31) {
            return BigDecimal.ZERO;
        }
        return MINUS_TEN_PERCENT;
    }
}
