package com.smarttheater.common.enums;

import lombok.Getter;

@Getter
public enum SeatType {
    VIP("VIP座"), STANDARD("普通座"), ECONOMY("经济座");
    private final String label;
    SeatType(String label) { this.label = label; }
}
