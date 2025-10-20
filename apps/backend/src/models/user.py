"""User model for authentication and creator tracking."""
from tortoise import fields
from tortoise.models import Model


class User(Model):
    """User account linked to Solana wallet with optional email/password."""

    id = fields.UUIDField(pk=True)

    # Solana wallet (primary identity)
    wallet_address = fields.CharField(max_length=44, unique=True, index=True)

    # Optional email/password for non-wallet access
    email = fields.CharField(max_length=255, unique=True, null=True, index=True)
    hashed_password = fields.CharField(max_length=255, null=True)

    # Profile
    username = fields.CharField(max_length=50, unique=True, null=True)
    display_name = fields.CharField(max_length=100, null=True)
    avatar_url = fields.CharField(max_length=500, null=True)
    bio = fields.TextField(null=True)

    # Roles & permissions
    is_active = fields.BooleanField(default=True)
    is_curator = fields.BooleanField(default=False)
    is_admin = fields.BooleanField(default=False)

    # Creator stats (denormalized for performance)
    total_markets_created = fields.IntField(default=0)
    total_volume_generated = fields.DecimalField(max_digits=20, decimal_places=2, default=0)

    # Timestamps
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)
    last_login_at = fields.DatetimeField(null=True)

    class Meta:
        table = "users"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"User({self.username or self.wallet_address[:8]})"
