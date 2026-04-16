package com.smarttheater.common.constant;

public class RedisKeyConstants {
    public static final String SEAT_LOCK_PREFIX = "seat:lock:";
    public static final String ORDER_EXPIRE_PREFIX = "order:expire:";
    public static final String JWT_BLACKLIST_PREFIX = "jwt:blacklist:";
    public static final String HOME_FEATURED = "home:featured";
    public static final String HOME_UPCOMING = "home:upcoming";
    public static final String HOME_STATS = "home:stats";
    public static final String CACHE_CATEGORIES = "cache:categories";
    public static final long SEAT_LOCK_TTL = 900L; // 15 minutes
    public static final long ORDER_EXPIRE_TTL = 900L;

    public static String seatLockKey(Long scheduleId, Long seatId) {
        return SEAT_LOCK_PREFIX + scheduleId + ":" + seatId;
    }
}
