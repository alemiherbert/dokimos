from app import db
from app.models import Equipment, Category

# Define the categories
categories = [
    {"name": "Excavators", "description": "Heavy equipment for digging and excavation."},
    {"name": "Graders", "description": "Equipment used for leveling and grading surfaces."},
    {"name": "Bulldozers", "description": "Heavy equipment for pushing large quantities of soil."},
    {"name": "Concrete Trucks", "description": "Vehicles for transporting concrete."},
    {"name": "Dump Trucks", "description": "Trucks for transporting loose material."},
    {"name": "Compactors", "description": "Equipment for compacting soil and other materials."},
    {"name": "Mobile Cranes", "description": "Cranes mounted on mobile platforms."},
    {"name": "Water Trucks", "description": "Vehicles designed to transport water."},
]

# Define the equipment entries with locations in major cities of Uganda
equipment_entries = [
    {"name": "Cat 320 Excavator", "category_name": "Excavators", "image_url": "/static/dist/img/equipment/cat-320-excavator.jpg", "location": "Kampala", "description": "Cat 320 Excavator for heavy-duty digging."},
    {"name": "Hitachi ZX200 Excavator", "category_name": "Excavators", "image_url": "/static/dist/img/equipment/hitachi-zx200-excavator.jpg", "location": "Entebbe", "description": "Hitachi ZX200 Excavator for efficient excavation."},
    {"name": "Komatsu PC210 Excavator", "category_name": "Excavators", "image_url": "/static/dist/img/equipment/komatsu-pc210-excavator.jpg", "location": "Jinja", "description": "Komatsu PC210 Excavator for robust digging."},
    {"name": "John Deere 670G Grader", "category_name": "Graders", "image_url": "/static/dist/img/equipment/john-deere-670g-grader.jpg", "location": "Mbarara", "description": "John Deere 670G Grader for precise leveling."},
    {"name": "Caterpillar D8T Bulldozer", "category_name": "Bulldozers", "image_url": "/static/dist/img/equipment/caterpillar-d8t-bulldozer.jpg", "location": "Kampala", "description": "Caterpillar D8T Bulldozer for powerful pushing."},
    {"name": "Mack Granite Concrete Truck", "category_name": "Concrete Trucks", "image_url": "/static/dist/img/equipment/mack-granite-concrete-truck.jpg", "location": "Entebbe", "description": "Mack Granite Concrete Truck for transporting concrete."},
    {"name": "Kenworth T880 Dump Truck", "category_name": "Dump Trucks", "image_url": "/static/dist/img/equipment/kenworth-t880-dump-truck.jpg", "location": "Jinja", "description": "Kenworth T880 Dump Truck for transporting loose material."},
    {"name": "Volvo FMX Dump Truck", "category_name": "Dump Trucks", "image_url": "/static/dist/img/equipment/volvo-fmx-dump-truck.jpg", "location": "Mbarara", "description": "Volvo FMX Dump Truck for reliable material transport."},
    {"name": "Bomag BW213DH-5 Compactor", "category_name": "Compactors", "image_url": "/static/dist/img/equipment/bomag-bw213dh-5-compactor.jpg", "location": "Kampala", "description": "Bomag BW213DH-5 Double Drum Compactor for effective soil compaction."},
    {"name": "Dynapac CA2500D Compactor", "category_name": "Compactors", "image_url": "/static/dist/img/equipment/dynapac-ca2500d-compactor.jpg", "location": "Entebbe", "description": "Dynapac CA2500D Single Drum Compactor for solid soil compaction."},
    {"name": "Hamm H13i Compactor", "category_name": "Compactors", "image_url": "/static/dist/img/equipment/hamm-h13i-compactor.jpg", "location": "Jinja", "description": "Hamm H13i Compactor for high-performance compaction."},
    {"name": "Sakai SV512D Compactor", "category_name": "Compactors", "image_url": "/static/dist/img/equipment/sakai-sv512d-compactor.jpg", "location": "Mbarara", "description": "Sakai SV512D Sheepsfoot Compactor for superior soil compaction."},
    {"name": "Grove GMK4100L Mobile Crane", "category_name": "Mobile Cranes", "image_url": "/static/dist/img/equipment/grove-gmk4100l-mobile-crane.jpg", "location": "Kampala", "description": "Grove GMK4100L Mobile Crane for versatile lifting."},
    {"name": "Mercedes-Benz Arocs Water Truck", "category_name": "Water Trucks", "image_url": "/static/dist/img/equipment/mercedes-benz-arocs-water-truck.jpg", "location": "Entebbe", "description": "Mercedes-Benz Arocs Water Truck for efficient water transport."},
]

# Insert categories into the database
for category in categories:
    cat = Category(name=category["name"], description=category["description"])
    db.session.add(cat)
    db.session.commit()
    cat.generate_slug()
    db.session.commit()

# Insert equipment into the database
for equipment in equipment_entries:
    category = Category.query.filter_by(name=equipment["category_name"]).first()
    if category:
        eq = Equipment(
            name=equipment["name"],
            location=equipment["location"],
            description=equipment["description"],
            category_id=category.id,
            image_url=equipment["image_url"]
        )
        db.session.add(eq)
        db.session.commit()
        eq.generate_slug()
        db.session.commit()
