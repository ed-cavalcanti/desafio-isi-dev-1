package com.app.model;

/**
 * Posições de campo e os pesos de cada atributo no cálculo do overall.
 */
public enum Position {
    GOL(10, 0, 20, 0, 40, 30),
    ZAG(10, 0, 15, 0, 45, 30),
    LAT(25, 0, 20, 15, 25, 15),
    MEI(10, 15, 35, 25, 5, 10),
    ATA(20, 40, 10, 20, 0, 10);

    private final int pace;
    private final int shooting;
    private final int passing;
    private final int dribbling;
    private final int defending;
    private final int physical;

    Position(int pace, int shooting, int passing, int dribbling, int defending, int physical) {
        this.pace = pace;
        this.shooting = shooting;
        this.passing = passing;
        this.dribbling = dribbling;
        this.defending = defending;
        this.physical = physical;
    }

    public int weight(Attribute attribute) {
        return switch (attribute) {
            case PACE -> pace;
            case SHOOTING -> shooting;
            case PASSING -> passing;
            case DRIBBLING -> dribbling;
            case DEFENDING -> defending;
            case PHYSICAL -> physical;
        };
    }
}
