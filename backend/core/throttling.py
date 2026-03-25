from rest_framework.throttling import AnonRateThrottle


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


class ContactRateThrottle(AnonRateThrottle):
    scope = "contact"
