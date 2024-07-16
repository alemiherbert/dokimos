from app import db
from sqlalchemy import select
from app.models import User, Equipment, Category, CartItem, Booking


def add_to_cart(user, equipment):
    if not equipment:
        return {"error": "Equipment not found"}

    if not equipment.available:
        return {"error": "Equipment is not available"}

    cart_item = CartItem(user_id=user.id, equipment_id=equipment.id)
    db.session.add(cart_item)
    equipment.available = False
    db.session.commit()
    return {"success": f"{equipment.name} added to cart"}


def remove_from_cart(user, equipment):
    cart_item = db.session.scalar(select(CartItem).where(
        CartItem.user_id == user.id,
        CartItem.equipment_id == equipment.id)
    )
    if not cart_item:
        return {"error": "Equipment not in cart"}

    db.session.delete(cart_item)
    equipment.available = True
    db.session.commit()
    return {"success": f"{equipment.name} removed from cart"}


def view_cart(user):
    cart_items = db.session.scalars(select(CartItem).where(CartItem.user_id == user.id)).all()
    return [item.equipment.to_dict() for item in cart_items]


def book_equipment(user):
    cart_items = db.session.scalars(select(CartItem).where(CartItem.user_id == user.id)).all()
    if not cart_items:
        return {"error": "Cart is empty"}

    for item in cart_items:
        booking = Booking(user_id=user.id, equipment_id=item.equipment_id)
        db.session.add(booking)
        db.session.delete(item)

    db.session.commit()
    return {"success": "Booking successful"}


def cancel_booking(user, booking_id):
    booking = db.session.scalar(select(Booking).where(Booking.id == booking_id, Booking.user_id == user.id))
    if not booking:
        return {"error": "Booking not found"}

    booking.status = "cancelled"
    booking.equipment.available = True
    db.session.commit()
    return {"success": "Booking cancelled"}
