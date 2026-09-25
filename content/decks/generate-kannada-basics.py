#!/usr/bin/env python3
"""Generate revia/content/decks/kannada-basics.json for import."""

import json
from pathlib import Path


def card(kn: str, roman: str, en: str, example=None, notes=None, tags=None):
    c = {
        "front": f"{kn} ({roman})",
        "back": en,
        "pronunciation": roman,
    }
    if example:
        c["example"] = example
    if notes:
        c["notes"] = notes
    if tags:
        c["tags"] = tags
    return c


def main():
    lessons = []

    lessons.append(
        {
            "title": "Greetings & Politeness",
            "description": "Essential greetings and polite words",
            "cards": [
                card("ನಮಸ್ಕಾರ", "namaskara", "Hello / Greetings", "ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರ?", "Universal formal greeting", ["greeting"]),
                card("ಶುಭೋದಯ", "shubhodaya", "Good morning", "ಶುಭೋದಯ! ಶುಭ ದಿನ.", None, ["greeting"]),
                card("ಶುಭ ಸಂಜೆ", "shubha sanje", "Good evening", None, None, ["greeting"]),
                card("ಶುಭ ರಾತ್ರಿ", "shubha raatri", "Good night", "ಶುಭ ರಾತ್ರಿ.", None, ["greeting"]),
                card("ಧನ್ಯವಾದಗಳು", "dhanyavaadagalu", "Thank you", "ಧನ್ಯವಾದಗಳು.", None, ["polite"]),
                card("ದಯವಿಟ್ಟು", "dayavittu", "Please", "ದಯವಿಟ್ಟು ಮತ್ತೆ ಹೇಳಿ.", None, ["polite"]),
                card("ಕ್ಷಮಿಸಿ", "kshamisi", "Sorry / Excuse me", "ತಡವಾದ್ದಕ್ಕೆ ಕ್ಷಮಿಸಿ.", None, ["polite"]),
                card("ಸ್ವಾಗತ", "swaagata", "Welcome", "ನಿಮಗೆ ಸ್ವಾಗತ.", None, ["polite"]),
                card("ಹೌದು", "haudu", "Yes", None, None, ["basic"]),
                card("ಇಲ್ಲ", "illa", "No", None, None, ["basic"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Introductions",
            "description": "Meeting people and talking about yourself",
            "cards": [
                card("ನೀವು ಹೇಗಿದ್ದೀರ?", "neevu hegiddira?", "How are you? (formal)", "ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರ?", "Informal: ನೀನು ಹೇಗಿದ್ದೀಯ?", ["introduction"]),
                card("ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ", "naanu chennaagiddene", "I am fine", "ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ.", None, ["introduction"]),
                card("ನಿಮ್ಮ ಹೆಸರೇನು?", "nimma hesarenu?", "What is your name?", None, None, ["introduction"]),
                card("ನನ್ನ ಹೆಸರು", "nanna hesaru", "My name is ...", "ನನ್ನ ಹೆಸರು ...", "Say your name after this", ["introduction"]),
                card("ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿ ಸಂತೋಷ", "nimmanu bhetiyaagi santosha", "Nice to meet you", None, None, ["introduction"]),
                card("ನಾನು ಕನ್ನಡ ಕಲಿಯುತ್ತಿದ್ದೇನೆ", "naanu kannada kaliyuttiddene", "I am learning Kannada", None, None, ["introduction"]),
                card("ನಾನು ... ಇಂದ ಬಂದಿದ್ದೇನೆ", "naanu ... inda bandiddene", "I am from ...", "ನಾನು ಬೆಂಗಳೂರಿನಿಂದ ಬಂದಿದ್ದೇನೆ.", "Place + inda = from", ["introduction"]),
                card("ನಿಮಗೆ ಕನ್ನಡ ಬರುತ್ತದೆಯ?", "nimge kannada baruttadeya?", "Do you know Kannada?", None, None, ["introduction"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Pronouns & Question Words",
            "description": "Core pronouns and question words",
            "cards": [
                card("ನಾನು", "naanu", "I", "ನಾನು ಹೋಗುತ್ತಿದ್ದೇನೆ.", None, ["grammar"]),
                card("ನೀನು", "neenu", "You (informal)", None, None, ["grammar"]),
                card("ನೀವು", "neevu", "You (formal)", None, None, ["grammar"]),
                card("ಅವನು", "avanu", "He", None, None, ["grammar"]),
                card("ಅವಳು", "avalu", "She", None, None, ["grammar"]),
                card("ಅವರು", "avaru", "They / respectful he or she", None, None, ["grammar"]),
                card("ನಾವು", "naavu", "We", None, None, ["grammar"]),
                card("ಇದು", "idu", "This", "ಇದು ನನ್ನ ಪುಸ್ತಕ.", None, ["grammar"]),
                card("ಅದು", "adu", "That", None, None, ["grammar"]),
                card("ಯಾರು", "yaaru", "Who", "ಅವರು ಯಾರು?", None, ["grammar"]),
                card("ಏನು", "enu", "What", "ಇದು ಏನು?", None, ["grammar"]),
                card("ಎಲ್ಲಿ", "elli", "Where", "ನೀವು ಎಲ್ಲಿ ವಾಸಿಸುತ್ತೀರ?", None, ["grammar"]),
                card("ಯಾವಾಗ", "yaavaga", "When", None, None, ["grammar"]),
                card("ಏಕೆ", "eke", "Why", None, None, ["grammar"]),
                card("ಹೇಗೆ", "hege", "How", None, None, ["grammar"]),
                card("ಎಷ್ಟು", "eshtu", "How much / how many", "ಇದು ಎಷ್ಟು?", None, ["grammar"]),
            ],
        }
    )

    nums_1_20 = [
        ("ಒಂದು", "ondu", "One"), ("ಎರಡು", "eradu", "Two"), ("ಮೂರು", "mooru", "Three"),
        ("ನಾಲ್ಕು", "naalku", "Four"), ("ಐದು", "aidu", "Five"), ("ಆರು", "aaru", "Six"),
        ("ಏಳು", "elu", "Seven"), ("ಎಂಟು", "entu", "Eight"), ("ಒಂಬತ್ತು", "ombattu", "Nine"),
        ("ಹತ್ತು", "hattu", "Ten"), ("ಹನ್ನೊಂದು", "hannondu", "Eleven"), ("ಹನ್ನೆರಡು", "hanneradu", "Twelve"),
        ("ಹದಿಮೂರು", "hadimooru", "Thirteen"), ("ಹದಿನಾಲ್ಕು", "hadinaalku", "Fourteen"),
        ("ಹದಿನೈದು", "hadinaidu", "Fifteen"), ("ಹದಿನಾರು", "hadinaaru", "Sixteen"),
        ("ಹದಿನೇಳು", "hadinelu", "Seventeen"), ("ಹದಿನೆಂಟು", "hadinentu", "Eighteen"),
        ("ಹತ್ತೊಂಬತ್ತು", "hattombattu", "Nineteen"), ("ಇಪ್ಪತ್ತು", "ippattu", "Twenty"),
    ]
    lessons.append(
        {
            "title": "Numbers 1–20",
            "description": "Basic counting",
            "cards": [card(k, r, e, tags=["numbers"]) for k, r, e in nums_1_20],
        }
    )

    lessons.append(
        {
            "title": "Numbers & Quantities",
            "description": "Tens, hundreds, and quantity words",
            "cards": [
                card("ಮೂವತ್ತು", "moovattu", "Thirty", tags=["numbers"]),
                card("ನಲವತ್ತು", "nalavattu", "Forty", tags=["numbers"]),
                card("ಐವತ್ತು", "aivattu", "Fifty", tags=["numbers"]),
                card("ಅರುವತ್ತು", "aruvattu", "Sixty", tags=["numbers"]),
                card("ಎಪ್ಪತ್ತು", "eppattu", "Seventy", tags=["numbers"]),
                card("ಎಂಬತ್ತು", "embattu", "Eighty", tags=["numbers"]),
                card("ತೊಂಬತ್ತು", "tombattu", "Ninety", tags=["numbers"]),
                card("ನೂರು", "nooru", "One hundred", tags=["numbers"]),
                card("ಸಾವಿರ", "saavira", "One thousand", tags=["numbers"]),
                card("ಎಲ್ಲಾ", "ellaa", "All", tags=["numbers"]),
                card("ಸ್ವಲ್ಪ", "swalpa", "A little / some", tags=["numbers"]),
                card("ಹಲವು", "halavu", "Many / several", tags=["numbers"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Days, Months & Time",
            "description": "Calendar and telling time",
            "cards": [
                card("ಇಂದು", "indu", "Today", tags=["time"]),
                card("ನಾಳೆ", "naale", "Tomorrow", tags=["time"]),
                card("ನಿನ್ನೆ", "ninne", "Yesterday", tags=["time"]),
                card("ಈಗ", "iga", "Now", tags=["time"]),
                card("ಸೋಮವಾರ", "somavara", "Monday", tags=["time"]),
                card("ಮಂಗಳವಾರ", "mangalavara", "Tuesday", tags=["time"]),
                card("ಬುಧವಾರ", "budhavara", "Wednesday", tags=["time"]),
                card("ಗುರುವಾರ", "guruvara", "Thursday", tags=["time"]),
                card("ಶುಕ್ರವಾರ", "shukravara", "Friday", tags=["time"]),
                card("ಶನಿವಾರ", "shanivara", "Saturday", tags=["time"]),
                card("ಭಾನುವಾರ", "bhanuvaara", "Sunday", tags=["time"]),
                card("ಜನವರಿ", "janavari", "January", notes="Gregorian months used in modern Kannada", tags=["time"]),
                card("ಏಪ್ರಿಲ್", "eprill", "April", tags=["time"]),
                card("ಜುಲೈ", "julai", "July", tags=["time"]),
                card("ಅಕ್ಟೋಬರ್", "oktobar", "October", tags=["time"]),
                card("ಡಿಸೆಂಬರ್", "disembar", "December", tags=["time"]),
                card("ಗಂಟೆ", "gante", "Hour / o'clock", tags=["time"]),
                card("ನಿಮಿಷ", "nimisha", "Minute", tags=["time"]),
                card("ಬೆಳಿಗ್ಗೆ", "beligge", "Morning", tags=["time"]),
                card("ಸಂಜೆ", "sanje", "Evening", tags=["time"]),
                card("ರಾತ್ರಿ", "raatri", "Night", tags=["time"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Family & People",
            "description": "Family members and relationships",
            "cards": [
                card("ಅಮ್ಮ", "amma", "Mother", tags=["family"]),
                card("ಅಪ್ಪ", "appa", "Father", tags=["family"]),
                card("ಅಕ್ಕ", "akka", "Elder sister", tags=["family"]),
                card("ತಂಗಿ", "tangi", "Younger sister", tags=["family"]),
                card("ಅಣ್ಣ", "anna", "Elder brother", tags=["family"]),
                card("ತಮ್ಮ", "thamma", "Younger brother", tags=["family"]),
                card("ಅಜ್ಜ", "ajja", "Grandfather", tags=["family"]),
                card("ಅಜ್ಜಿ", "ajji", "Grandmother", tags=["family"]),
                card("ಮಗ", "maga", "Son", tags=["family"]),
                card("ಮಗಳು", "magalu", "Daughter", tags=["family"]),
                card("ಗಂಡ", "ganda", "Husband", tags=["family"]),
                card("ಹೆಂಡತಿ", "hendati", "Wife", tags=["family"]),
                card("ಕುಟುಂಬ", "kutumba", "Family", tags=["family"]),
                card("ಸ್ನೇಹಿತ", "sneehita", "Friend (male)", tags=["family"]),
                card("ಸ್ನೇಹಿತೆ", "sneehite", "Friend (female)", tags=["family"]),
                card("ಮಗು", "magu", "Child", tags=["family"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Body Parts",
            "description": "Parts of the body",
            "cards": [
                card("ತಲೆ", "tale", "Head", tags=["body"]),
                card("ಕಣ್ಣು", "kannu", "Eye", tags=["body"]),
                card("ಕಿವಿ", "kivi", "Ear", tags=["body"]),
                card("ಮೂಗು", "moogu", "Nose", tags=["body"]),
                card("ಬಾಯಿ", "baayi", "Mouth", tags=["body"]),
                card("ಕೈ", "kai", "Hand", tags=["body"]),
                card("ಕಾಲು", "kaalu", "Leg / foot", tags=["body"]),
                card("ಬೆರಳು", "beralu", "Finger", tags=["body"]),
                card("ಹೃದಯ", "hrudaya", "Heart", tags=["body"]),
                card("ಹೊಟ್ಟೆ", "hotte", "Stomach / belly", tags=["body"]),
                card("ಬೆನ್ನು", "bennu", "Back", tags=["body"]),
                card("ಕತ್ತು", "kattu", "Neck", tags=["body"]),
                card("ಮುಖ", "mukha", "Face", tags=["body"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Colors",
            "description": "Common colors",
            "cards": [
                card("ಕೆಂಪು", "kempu", "Red", tags=["colors"]),
                card("ನೀಲಿ", "neeli", "Blue", tags=["colors"]),
                card("ಹಸಿರು", "hasiru", "Green", tags=["colors"]),
                card("ಹಳದಿ", "haladi", "Yellow", tags=["colors"]),
                card("ಕಪ್ಪು", "kappu", "Black", tags=["colors"]),
                card("ಬಿಳಿ", "bili", "White", tags=["colors"]),
                card("ಕಿತ್ತಳೆ", "kittale", "Orange", tags=["colors"]),
                card("ನೇರಳೆ", "nerale", "Purple", tags=["colors"]),
                card("ಗುಲಾಬಿ", "gulaabi", "Pink", tags=["colors"]),
                card("ಬೂದು", "boodu", "Gray", tags=["colors"]),
                card("ಕಾಫಿ ಬಣ್ಣ", "kaafi banna", "Brown", notes="Literally coffee color", tags=["colors"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Food & Drink",
            "description": "Common food and dining words",
            "cards": [
                card("ಊಟ", "oota", "Food / meal", tags=["food"]),
                card("ಅನ್ನ", "anna", "Cooked rice / food", notes="General word for food", tags=["food"]),
                card("ನೀರು", "neeru", "Water", tags=["food"]),
                card("ಹಾಲು", "haalu", "Milk", tags=["food"]),
                card("ಚಹಾ", "chaha", "Tea", tags=["food"]),
                card("ಕಾಫಿ", "kaafi", "Coffee", tags=["food"]),
                card("ರೊಟ್ಟಿ", "rotti", "Bread / roti", tags=["food"]),
                card("ಅಕ್ಕಿ", "akki", "Rice (uncooked)", tags=["food"]),
                card("ಸಾಂಬಾರ", "saambar", "Sambar", tags=["food"]),
                card("ದೋಸೆ", "dose", "Dosa", tags=["food"]),
                card("ಇಡ್ಲಿ", "idli", "Idli", tags=["food"]),
                card("ಹಣ್ಣು", "hannu", "Fruit", tags=["food"]),
                card("ತರಕಾರಿ", "tarakaari", "Vegetable", tags=["food"]),
                card("ಮಾಂಸ", "maamsa", "Meat", tags=["food"]),
                card("ಮೀನು", "meenu", "Fish", tags=["food"]),
                card("ಸಿಹಿ", "sihi", "Sweet", tags=["food"]),
                card("ಖಾರ", "khaara", "Spicy / salty", tags=["food"]),
                card("ರುಚಿ", "ruchi", "Taste / flavor", tags=["food"]),
                card("ಹಸಿವು", "hasivu", "Hunger / hungry", "ಹಸಿವಾಗಿದೆ.", tags=["food"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Home & Objects",
            "description": "Home, rooms, and everyday objects",
            "cards": [
                card("ಮನೆ", "mane", "House / home", tags=["home"]),
                card("ಕೊಠಡಿ", "kothadi", "Room", tags=["home"]),
                card("ಅಡುಗೆಮನೆ", "adugemane", "Kitchen", tags=["home"]),
                card("ಸ್ನಾನಗೃಹ", "snaanagriha", "Bathroom", tags=["home"]),
                card("ಬಾಗಿಲು", "baagilu", "Door", tags=["home"]),
                card("ಕಿಟಕಿ", "kitaki", "Window", tags=["home"]),
                card("ಮಂಚ", "mancha", "Bed", tags=["home"]),
                card("ಮೇಜು", "meju", "Table", tags=["home"]),
                card("ಕುರ್ಚಿ", "kurchi", "Chair", tags=["home"]),
                card("ದೀಪ", "deepa", "Lamp / light", tags=["home"]),
                card("ಪುಸ್ತಕ", "pustaka", "Book", tags=["home"]),
                card("ಫೋನ್", "phone", "Phone", tags=["home"]),
                card("ಚಾವಿ", "chaavi", "Key", tags=["home"]),
                card("ಚೀಲ", "cheela", "Bag", tags=["home"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Clothes",
            "description": "Clothing",
            "cards": [
                card("ಬಟ್ಟೆ", "batte", "Cloth / clothes", tags=["clothes"]),
                card("ಅಂಗಿ", "angi", "Shirt", tags=["clothes"]),
                card("ಪ್ಯಾಂಟ್", "paant", "Pants", tags=["clothes"]),
                card("ಸೀರೆ", "seere", "Saree", tags=["clothes"]),
                card("ಶರ್ಟು", "shirtu", "Shirt", tags=["clothes"]),
                card("ಶೂ", "shoo", "Shoes", tags=["clothes"]),
                card("ಟೋಪಿ", "topi", "Hat / cap", tags=["clothes"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Nature & Weather",
            "description": "Nature, animals, and weather",
            "cards": [
                card("ಸೂರ್ಯ", "soorya", "Sun", tags=["nature"]),
                card("ಚಂದ್ರ", "chandra", "Moon", tags=["nature"]),
                card("ನಕ್ಷತ್ರ", "nakshatra", "Star", tags=["nature"]),
                card("ಮಳೆ", "male", "Rain", tags=["nature"]),
                card("ಗಾಳಿ", "gaali", "Wind", tags=["nature"]),
                card("ಬೆಟ್ಟ", "betta", "Hill / mountain", tags=["nature"]),
                card("ನದಿ", "nadi", "River", tags=["nature"]),
                card("ಸಮುದ್ರ", "samudra", "Sea / ocean", tags=["nature"]),
                card("ಮರ", "mara", "Tree", tags=["nature"]),
                card("ಹೂ", "hoo", "Flower", tags=["nature"]),
                card("ನಾಯಿ", "naayi", "Dog", tags=["nature"]),
                card("ಬೆಕ್ಕು", "bekku", "Cat", tags=["nature"]),
                card("ಹಸು", "hasu", "Cow", tags=["nature"]),
                card("ಪಕ್ಷಿ", "pakshi", "Bird", tags=["nature"]),
                card("ಬಿಸಿಲು", "bisilu", "Heat / sunny", tags=["nature"]),
                card("ಚಳಿ", "chali", "Cold", tags=["nature"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Places & Directions",
            "description": "Places and getting around",
            "cards": [
                card("ನಗರ", "nagara", "City", tags=["places"]),
                card("ಗ್ರಾಮ", "graama", "Village", tags=["places"]),
                card("ರಸ್ತೆ", "raste", "Road / street", tags=["places"]),
                card("ಆಸ್ಪತ್ರೆ", "aaspatre", "Hospital", tags=["places"]),
                card("ಶಾಲೆ", "shaale", "School", tags=["places"]),
                card("ಕಚೇರಿ", "kacheri", "Office", tags=["places"]),
                card("ಮಾರುಕಟ್ಟೆ", "maarukatte", "Market", tags=["places"]),
                card("ನಿಲ್ದಾಣ", "nildana", "Station / stop", tags=["places"]),
                card("ಎಡ", "eda", "Left", tags=["places"]),
                card("ಬಲ", "bala", "Right", tags=["places"]),
                card("ನೇರ", "nera", "Straight", tags=["places"]),
                card("ಹತ್ತಿರ", "hattira", "Near", tags=["places"]),
                card("ದೂರ", "doora", "Far", tags=["places"]),
                card("ಇಲ್ಲಿ", "illi", "Here", tags=["places"]),
                card("ಅಲ್ಲಿ", "alli", "There", tags=["places"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Transport",
            "description": "Vehicles and travel",
            "cards": [
                card("ಬಸ್", "bas", "Bus", tags=["transport"]),
                card("ಟ್ರೈನ್", "train", "Train", tags=["transport"]),
                card("ಕಾರು", "kaaru", "Car", tags=["transport"]),
                card("ಬೈಕ್", "baik", "Bike / motorcycle", tags=["transport"]),
                card("ಸೈಕಲ್", "saikal", "Bicycle", tags=["transport"]),
                card("ಟ್ಯಾಕ್ಸಿ", "taksi", "Taxi", tags=["transport"]),
                card("ವಿಮಾನ", "vimaana", "Airplane", tags=["transport"]),
                card("ಟಿಕೆಟ್", "tiket", "Ticket", tags=["transport"]),
                card("ಪ್ರಯಾಣ", "prayaana", "Journey / travel", tags=["transport"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Common Verbs",
            "description": "Everyday action verbs",
            "cards": [
                card("ಹೋಗು", "hogu", "Go", "ನಾನು ಮನೆಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ.", tags=["verbs"]),
                card("ಬರು", "baru", "Come", "ನೀವು ಬನ್ನಿ.", tags=["verbs"]),
                card("ತಿನ್ನು", "tinnu", "Eat", "ನಾನು ಊಟ ಮಾಡುತ್ತಿದ್ದೇನೆ.", tags=["verbs"]),
                card("ಕುಡಿ", "kudi", "Drink", tags=["verbs"]),
                card("ನೋಡು", "nodu", "See / look", tags=["verbs"]),
                card("ಕೇಳು", "kelu", "Listen / ask", tags=["verbs"]),
                card("ಮಾತನಾಡು", "maatanaadu", "Speak", tags=["verbs"]),
                card("ಬರೆ", "bare", "Write", tags=["verbs"]),
                card("ಓದು", "odu", "Read", tags=["verbs"]),
                card("ಕಲಿ", "kali", "Learn", tags=["verbs"]),
                card("ಕೆಲಸ", "kelasa", "Work", tags=["verbs"]),
                card("ನಿದ್ರೆ", "nidre", "Sleep", tags=["verbs"]),
                card("ಎದ್ದೇಳು", "eddelu", "Wake up", tags=["verbs"]),
                card("ನಡೆ", "nade", "Walk", tags=["verbs"]),
                card("ಓಡು", "odu", "Run", tags=["verbs"]),
                card("ಕೊಡು", "kodu", "Give", tags=["verbs"]),
                card("ತೆಗೆ", "tege", "Take", tags=["verbs"]),
                card("ತಿಳಿ", "tili", "Know / understand", tags=["verbs"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Adjectives & Feelings",
            "description": "Describing things and emotions",
            "cards": [
                card("ಚೆನ್ನಾಗಿ", "chennaagi", "Well / good", tags=["adjectives"]),
                card("ಕೆಟ್ಟ", "ketta", "Bad", tags=["adjectives"]),
                card("ದೊಡ್ಡ", "dodda", "Big", tags=["adjectives"]),
                card("ಚಿಕ್ಕ", "chikka", "Small", tags=["adjectives"]),
                card("ಹೊಸ", "hosa", "New", tags=["adjectives"]),
                card("ಹಳೆಯ", "haleya", "Old", tags=["adjectives"]),
                card("ಸುಂದರ", "sundara", "Beautiful", tags=["adjectives"]),
                card("ಸಂತೋಷ", "santosha", "Happy / happiness", tags=["adjectives"]),
                card("ದುಃಖ", "duhkha", "Sad / sorrow", tags=["adjectives"]),
                card("ಆಸೆ", "aase", "Hope / desire", tags=["adjectives"]),
                card("ಭಯ", "bhaya", "Fear", tags=["adjectives"]),
                card("ಬಿಸಿ", "bisi", "Hot", tags=["adjectives"]),
                card("ತಂಪು", "thampu", "Cool / warm", tags=["adjectives"]),
                card("ತುಂಬಾ", "tumbaa", "Very / a lot", tags=["adjectives"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Useful Phrases",
            "description": "High-frequency sentences for daily life",
            "cards": [
                card("ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ", "nanage arthavaagalilla", "I don't understand", tags=["phrases"]),
                card("ದಯವಿಟ್ಟು ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ", "dayavittu nidhaanavaagi maatanaadi", "Please speak slowly", tags=["phrases"]),
                card("ಇದು ಎಷ್ಟು?", "idu eshtu?", "How much is this?", tags=["phrases"]),
                card("ನೀವು ಇಂಗ್ಲಿಷ್ ಮಾತನಾಡುತ್ತೀರ?", "neevu inglish maatanaaduttira?", "Do you speak English?", tags=["phrases"]),
                card("ನನಗೆ ಸಹಾಯ ಬೇಕು", "nanage sahaaya beku", "I need help", tags=["phrases"]),
                card("ಎಲ್ಲಿ ಶೌಚಾಲಯ?", "elli shouchaalaya?", "Where is the restroom?", tags=["phrases"]),
                card("ನಾನು ಕಳೆದುಕೊಂಡಿದ್ದೇನೆ", "naanu kaledukondiddene", "I am lost", tags=["phrases"]),
                card("ಒಂದು ನಿಮಿಷ", "ondu nimisha", "One moment", tags=["phrases"]),
                card("ಮತ್ತೆ ಹೇಳಿ", "matte heli", "Say it again", tags=["phrases"]),
                card("ಸರಿ", "sari", "Okay / correct", tags=["phrases"]),
                card("ಸಮಯವಾಯಿತು", "samayavaayitu", "Time is up / it's late", tags=["phrases"]),
                card("ಶುಭ ದಿನ", "shubha dina", "Have a good day", tags=["phrases"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Kannada Culture & Karnataka",
            "description": "Language, state, and cultural context",
            "cards": [
                card("ಕನ್ನಡ", "kannada", "Kannada (language)", tags=["culture"]),
                card("ಕರ್ನಾಟಕ", "karnataka", "Karnataka (state)", tags=["culture"]),
                card("ಬೆಂಗಳೂರು", "bengaluru", "Bengaluru / Bangalore", tags=["culture"]),
                card("ಮೈಸೂರು", "maisuru", "Mysuru / Mysore", tags=["culture"]),
                card("ಯುಗಾದಿ", "yugaadi", "Kannada New Year festival", tags=["culture"]),
                card("ದಸರಾ", "dasara", "Dasara festival", tags=["culture"]),
                card("ಕರ್ನಾಟಕ ಸಂಗೀತ", "karnataka sangeeta", "Carnatic music tradition", tags=["culture"]),
                card("ಕನ್ನಡ ಸಾಹಿತ್ಯ", "kannada saahitya", "Kannada literature", tags=["culture"]),
                card("ರಾಜ್ಯ ಭಾಷೆ", "raajya bhaashe", "State language", notes="Kannada is Karnataka's official language", tags=["culture"]),
                card("ಪ್ರಾಚೀನ ಭಾಷೆ", "praachina bhaashe", "Classical language", notes="Kannada has classical language status in India", tags=["culture"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Money & Shopping",
            "description": "Buying, selling, and money",
            "cards": [
                card("ಹಣ", "hana", "Money", tags=["shopping"]),
                card("ಬೆಲೆ", "bele", "Price", tags=["shopping"]),
                card("ಖರೀದಿ", "kharidi", "Purchase / buy", tags=["shopping"]),
                card("ಮಾರಾಟ", "maarata", "Sale / sell", tags=["shopping"]),
                card("ರೂಪಾಯಿ", "roopaayi", "Rupee", tags=["shopping"]),
                card("ಸಿಗುತ್ತದೆ", "siguttade", "Available / you get", tags=["shopping"]),
                card("ಬೇಕು", "beku", "Want / need", tags=["shopping"]),
                card("ಬೇಡ", "beda", "Don't want / not needed", tags=["shopping"]),
                card("ಕಡೆ", "kade", "Shop / store", tags=["shopping"]),
                card("ಬಿಲ್", "bill", "Bill / receipt", tags=["shopping"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Health & Emergencies",
            "description": "Health, doctor, and emergency phrases",
            "cards": [
                card("ಆರೋಗ್ಯ", "aarogya", "Health", tags=["health"]),
                card("ವೈದ್ಯ", "vaidya", "Doctor", tags=["health"]),
                card("ಮದ್ದು", "maddu", "Medicine", tags=["health"]),
                card("ನೋವು", "novu", "Pain", tags=["health"]),
                card("ಜ್ವರ", "jwara", "Fever", tags=["health"]),
                card("ಆಸ್ಪತ್ರೆಗೆ ಕರೆ ಮಾಡಿ", "aaspatrege kare maadi", "Call an ambulance / hospital", tags=["health"]),
                card("ನನಗೆ ನೋವಾಗಿದೆ", "nanage novaagide", "I am in pain / it hurts", tags=["health"]),
                card("ಅಪಾಯ", "apaaya", "Danger", tags=["health"]),
                card("ಸಹಾಯ", "sahaaya", "Help", tags=["health"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Work & Occupations",
            "description": "Jobs and workplace words",
            "cards": [
                card("ಉದ್ಯೋಗ", "udyoga", "Job / employment", tags=["work"]),
                card("ವಿದ್ಯಾರ್ಥಿ", "vidyaarthi", "Student", tags=["work"]),
                card("ಶಿಕ್ಷಕ", "shikshaka", "Teacher (male)", tags=["work"]),
                card("ಶಿಕ್ಷಕಿ", "shikshaki", "Teacher (female)", tags=["work"]),
                card("ಎಂಜಿನಿಯರ್", "enjiniyar", "Engineer", tags=["work"]),
                card("ವ್ಯಾಪಾರಿ", "vyaapaari", "Businessperson / merchant", tags=["work"]),
                card("ರೈತ", "raita", "Farmer", tags=["work"]),
                card("ಕಚೇರಿ", "kacheri", "Office", tags=["work"]),
                card("ಸಭೆ", "sabhe", "Meeting", tags=["work"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Grammar Essentials",
            "description": "Postpositions, conjunctions, and sentence glue",
            "cards": [
                card("ಮತ್ತು", "mattu", "And", tags=["grammar"]),
                card("ಆದರೆ", "aadare", "But", tags=["grammar"]),
                card("ಅಥವಾ", "athava", "Or", tags=["grammar"]),
                card("ಏಕೆಂದರೆ", "ekendare", "Because", tags=["grammar"]),
                card("ಇಂದ", "inda", "From / since", tags=["grammar"]),
                card("ಗೆ", "ge", "To / for (dative)", tags=["grammar"]),
                card("ಅಲ್ಲಿ", "alli", "In / at (locative)", tags=["grammar"]),
                card("ಇಲ್ಲ", "illa", "Not / there isn't", notes="Same spelling as 'no' — context distinguishes", tags=["grammar"]),
                card("ಇದೆ", "ide", "Is / exists", tags=["grammar"]),
                card("ಇಲ್ಲವೇ?", "illave?", "Isn't it? / right?", tags=["grammar"]),
                card("ಬಹಳ", "bahala", "Very / much", tags=["grammar"]),
                card("ಇನ್ನೂ", "innu", "Still / yet / more", tags=["grammar"]),
            ],
        }
    )

    deck = {
        "deck": {
            "title": "Kannada Basics",
            "description": "Comprehensive Kannada foundation: greetings, grammar, numbers, family, food, travel, verbs, phrases, and culture. Front shows Kannada with romanization; back shows English.",
            "language": "Kannada",
            "tags": ["kannada", "language", "basics", "india", "karnataka"],
        },
        "lessons": lessons,
    }

    out = Path(__file__).parent / "kannada-basics.json"
    out.write_text(json.dumps(deck, ensure_ascii=False, indent=2), encoding="utf-8")

    total_cards = sum(len(l["cards"]) for l in lessons)
    print(f"Wrote {out}")
    print(f"Lessons: {len(lessons)}, Cards: {total_cards}")


if __name__ == "__main__":
    main()
