"""
Seed initial demo data for the AI-Powered Emergency Response Intelligence Platform.
Creates:
- Demo Super Admin (admin@erip.in / password123)
- Key Disaster Management Agencies (NDRF, SDRF, Fire, Medical)
- Active Incidents across India with GPS coordinates and AI scores
- Citizen SOS reports
"""

import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import User, Agency
from incidents.models import Incident, SOSReport

def seed():
    print("[+] Seeding Emergency Response Intelligence Platform data...")

    # 1. Create Agencies
    agencies_data = [
        {
            'name': 'National Disaster Response Force (NDRF)',
            'code': 'NDRF-HQ',
            'agency_type': 'ndrf',
            'state': 'Delhi',
            'district': 'New Delhi',
            'contact_email': 'controlroom@ndrf.gov.in',
            'contact_phone': '+911124363260',
        },
        {
            'name': 'Odisha State Disaster Management Authority (OSDMA)',
            'code': 'OSDMA-OD',
            'agency_type': 'sdrf',
            'state': 'Odisha',
            'district': 'Bhubaneswar',
            'contact_email': 'control@osdma.gov.in',
            'contact_phone': '+916742395398',
        },
        {
            'name': 'Maharashtra Fire & Rescue Emergency Services',
            'code': 'MFES-MH',
            'agency_type': 'fire',
            'state': 'Maharashtra',
            'district': 'Mumbai',
            'contact_email': 'emergency@mahafire.gov.in',
            'contact_phone': '+912223076111',
        },
        {
            'name': 'Kerala Disaster Management & Medical Relief',
            'code': 'KDMA-KL',
            'agency_type': 'medical',
            'state': 'Kerala',
            'district': 'Thiruvananthapuram',
            'contact_email': 'relief@keralasdma.gov.in',
            'contact_phone': '+914712331345',
        },
    ]

    agencies = {}
    for data in agencies_data:
        agency, created = Agency.objects.get_or_create(code=data['code'], defaults=data)
        agencies[agency.code] = agency
        if created:
            print(f"  + Agency created: {agency.name}")

    # 2. Create Demo Super Admin / Commander
    admin_user, created = User.objects.get_or_create(
        email='admin@erip.in',
        defaults={
            'first_name': 'Aarav',
            'last_name': 'Sharma',
            'role': 'super_admin',
            'phone': '+919876543210',
            'agency': agencies['NDRF-HQ'],
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin_user.set_password('password123')
        admin_user.save()
        print("  + Super Admin created: admin@erip.in (pwd: password123)")
    else:
        admin_user.set_password('password123')
        admin_user.save()
        print("  * Super Admin updated password: admin@erip.in (pwd: password123)")

    # 3. Create Demo Incidents across India
    now = timezone.now()
    incidents_data = [
        {
            'title': 'Severe Cyclone Dana - Coastal Surge & Inundation',
            'description': 'Category-3 equivalent tropical cyclone landfall approaching coastal belt. Winds up to 120 km/h, storm surge of 1.5m predicted, extensive low-lying flooding.',
            'disaster_type': 'cyclone',
            'disaster_subtype': 'Tropical Cyclone & Storm Surge',
            'status': 'active',
            'alert_level': 'red',
            'latitude': 20.9517,
            'longitude': 86.8530,
            'state': 'Odisha',
            'district': 'Bhadrak',
            'address': 'Dhamra Port & Coastal Blocks, Bhadrak',
            'affected_area_km2': 450.0,
            'affected_population': 185000,
            'injured_count': 34,
            'missing_count': 6,
            'death_count': 2,
            'severity_score': 0.94,
            'priority_score': 0.98,
            'risk_score': 0.92,
            'reported_by': admin_user,
            'assigned_agency': agencies['OSDMA-OD'],
            'incident_time': now - timedelta(hours=4),
        },
        {
            'title': 'Flash Flooding & Mithi River Overspill',
            'description': 'Record rainfall of 240mm in 6 hours triggered urban flooding, railway track submergence, and traffic paralysis in western suburbs.',
            'disaster_type': 'flood',
            'disaster_subtype': 'Urban Flash Flood',
            'status': 'responding',
            'alert_level': 'red',
            'latitude': 19.0760,
            'longitude': 72.8777,
            'state': 'Maharashtra',
            'district': 'Mumbai Suburban',
            'address': 'Kurla, Sion, and Andheri Subway corridor',
            'affected_area_km2': 85.0,
            'affected_population': 340000,
            'injured_count': 18,
            'missing_count': 2,
            'death_count': 1,
            'severity_score': 0.88,
            'priority_score': 0.91,
            'risk_score': 0.85,
            'reported_by': admin_user,
            'assigned_agency': agencies['MFES-MH'],
            'incident_time': now - timedelta(hours=7),
        },
        {
            'title': 'Major Landslide & Debris Flow - Meppadi Sector',
            'description': 'Heavy monsoon precipitation triggered hill slope failure blocking state highway. 12 houses buried in sediment and debris.',
            'disaster_type': 'landslide',
            'disaster_subtype': 'Debris Avalanche',
            'status': 'active',
            'alert_level': 'red',
            'latitude': 11.5534,
            'longitude': 76.1320,
            'state': 'Kerala',
            'district': 'Wayanad',
            'address': 'Chooralmala - Mundakkai Road, Meppadi',
            'affected_area_km2': 12.5,
            'affected_population': 1200,
            'injured_count': 42,
            'missing_count': 14,
            'death_count': 8,
            'severity_score': 0.96,
            'priority_score': 0.99,
            'risk_score': 0.95,
            'reported_by': admin_user,
            'assigned_agency': agencies['KDMA-KL'],
            'incident_time': now - timedelta(hours=12),
        },
        {
            'title': 'Beas River Spate & Highway Breach',
            'description': 'Cloudburst upstream caused rapid surge in Beas river flow, washing away 200m section of NH-3 and inundating riverside structures.',
            'disaster_type': 'flood',
            'disaster_subtype': 'Cloudburst Riverine Surge',
            'status': 'responding',
            'alert_level': 'orange',
            'latitude': 31.9579,
            'longitude': 77.1095,
            'state': 'Himachal Pradesh',
            'district': 'Kullu',
            'address': 'Near Aut Tunnel, NH-3',
            'affected_area_km2': 28.0,
            'affected_population': 6500,
            'injured_count': 7,
            'missing_count': 1,
            'death_count': 0,
            'severity_score': 0.76,
            'priority_score': 0.82,
            'risk_score': 0.74,
            'reported_by': admin_user,
            'assigned_agency': agencies['NDRF-HQ'],
            'incident_time': now - timedelta(hours=18),
        },
        {
            'title': 'Industrial Chemical Leak & Perimeter Fire',
            'description': 'Benzene storage valve failure led to vapor plume and localized fire in chemical industrial estate. Precautionary evacuation within 1.5km zone.',
            'disaster_type': 'industrial',
            'disaster_subtype': 'Toxic Vapor Release',
            'status': 'controlled',
            'alert_level': 'orange',
            'latitude': 21.6264,
            'longitude': 72.9990,
            'state': 'Gujarat',
            'district': 'Bharuch',
            'address': 'GIDC Industrial Estate, Ankleshwar',
            'affected_area_km2': 4.2,
            'affected_population': 8500,
            'injured_count': 23,
            'missing_count': 0,
            'death_count': 0,
            'severity_score': 0.72,
            'priority_score': 0.78,
            'risk_score': 0.69,
            'reported_by': admin_user,
            'assigned_agency': agencies['NDRF-HQ'],
            'incident_time': now - timedelta(hours=22),
        },
    ]

    for inc_data in incidents_data:
        inc, created = Incident.objects.get_or_create(
            title=inc_data['title'],
            defaults=inc_data
        )
        if created:
            print(f"  + Incident created: {inc.title}")

    # 4. Create SOS Citizen Reports
    cyclone_inc = Incident.objects.filter(disaster_type='cyclone').first()
    flood_inc = Incident.objects.filter(disaster_type='flood').first()
    landslide_inc = Incident.objects.filter(disaster_type='landslide').first()

    sos_data = [
        {
            'reporter_name': 'Sunil Mohapatra',
            'reporter_phone': '+919437123456',
            'severity': 5,
            'description': 'Water level rising rapidly past 6 feet on Ground floor. 4 elders and 2 infants trapped on terrace. Urgent rescue boat needed!',
            'people_trapped': 6,
            'latitude': 20.9540,
            'longitude': 86.8510,
            'address': 'Ward 4, Near Jagannath Temple, Dhamra, Bhadrak, Odisha',
            'landmark': 'Near Jagannath Temple',
            'is_verified': True,
            'linked_incident': cyclone_inc,
            'ai_classification': {'category': 'flood_rescue', 'urgency': 'critical', 'recommended_response': 'Boat evacuation team'},
        },
        {
            'reporter_name': 'Pooja Kulkarni',
            'reporter_phone': '+919820123987',
            'severity': 4,
            'description': 'Severe waterlogging inside society compound. Electric transformer spark reported. Ground floor residents evacuated to club house.',
            'people_trapped': 0,
            'latitude': 19.0680,
            'longitude': 72.8710,
            'address': 'Bldg 3, Kamani Junction, Kurla West, Mumbai',
            'landmark': 'Kamani Junction',
            'is_verified': True,
            'linked_incident': flood_inc,
            'ai_classification': {'category': 'waterlogging_electrical', 'urgency': 'high', 'recommended_response': 'Power grid cutoff & drainage pumps'},
        },
        {
            'reporter_name': 'Jitin Mathew',
            'reporter_phone': '+919447556677',
            'severity': 5,
            'description': 'Road completely washed out by mudslide. Three plantation worker quarters submerged in mud. Immediate earthmover and medical team needed.',
            'people_trapped': 8,
            'latitude': 11.5540,
            'longitude': 76.1340,
            'address': 'Mundakkai tea estate line 2, Chooralmala, Wayanad, Kerala',
            'landmark': 'Tea estate line 2',
            'is_verified': True,
            'linked_incident': landslide_inc,
            'ai_classification': {'category': 'landslide_entrapment', 'urgency': 'life_threatening', 'recommended_response': 'NDRF search & rescue + Air ambulance'},
        },
    ]

    for item in sos_data:
        sos, created = SOSReport.objects.get_or_create(
            reporter_phone=item['reporter_phone'],
            defaults=item
        )
        if created:
            print(f"  + SOS Report created from: {sos.reporter_name}")

    print("[SUCCESS] All seed data generated successfully!")

if __name__ == '__main__':
    seed()
