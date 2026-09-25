#!/usr/bin/env python3
"""Generate revia/content/decks/telugu-basics.json for import."""

import json
from pathlib import Path


def card(te: str, roman: str, en: str, example=None, notes=None, tags=None):
    c = {
        "front": f"{te} ({roman})",
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
                card("నమస్కారం", "namaskaram", "Hello / Greetings", "నమస్కారం, మీరు ఎలా ఉన్నారు?", "Universal formal greeting", ["greeting"]),
                card("శుభోదయం", "shubhodayam", "Good morning", "శుభోదయం! మంచి రోజు.", None, ["greeting"]),
                card("శుభ సాయంత్రం", "shubha saayanthram", "Good evening", None, None, ["greeting"]),
                card("శుభ రాత్రి", "shubha raatri", "Good night", "శుభ రాత్రి.", None, ["greeting"]),
                card("ధన్యవాదాలు", "dhanyavaadaalu", "Thank you", "ధన్యవాదాలు.", None, ["polite"]),
                card("దయచేసి", "dayacheesi", "Please", "దయచేసి మళ్లీ చెప్పండి.", None, ["polite"]),
                card("క్షమించండి", "kshaminchandi", "Sorry / Excuse me", "ఆలస్యమైనందుకు క్షమించండి.", None, ["polite"]),
                card("స్వాగతం", "swaagatam", "Welcome", "మీకు స్వాగతం.", None, ["polite"]),
                card("అవును", "avunu", "Yes", None, None, ["basic"]),
                card("లేదు", "ledu", "No", None, None, ["basic"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Introductions",
            "description": "Meeting people and talking about yourself",
            "cards": [
                card("మీరు ఎలా ఉన్నారు?", "meeru elaa unnaaru?", "How are you? (formal)", "నమస్కారం, మీరు ఎలా ఉన్నారు?", "Informal: నువ్వు ఎలా ఉన్నావు?", ["introduction"]),
                card("నేను బాగున్నాను", "nenu baagunnaanu", "I am fine", "నేను బాగున్నాను.", None, ["introduction"]),
                card("మీ పేరు ఏమిటి?", "mee peru emiti?", "What is your name?", None, None, ["introduction"]),
                card("నా పేరు", "naa peru", "My name is ...", "నా పేరు ...", "Say your name after this", ["introduction"]),
                card("మిమ్మల్ని కలవడం సంతోషం", "mimmlni kalavadam santosham", "Nice to meet you", None, None, ["introduction"]),
                card("నేను తెలుగు నేర్చుకుంటున్నాను", "nenu telugu nerchukuntunnaanu", "I am learning Telugu", None, None, ["introduction"]),
                card("నేను ... నుండి వచ్చాను", "nenu ... nundi vachchaanu", "I am from ...", "నేను హైదరాబాద్ నుండి వచ్చాను.", "Place + nundi = from", ["introduction"]),
                card("మీకు తెలుగు వస్తుందా?", "meeku telugu vasthundaa?", "Do you know Telugu?", None, None, ["introduction"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Pronouns & Question Words",
            "description": "Core pronouns and question words",
            "cards": [
                card("నేను", "nenu", "I", "నేను వెళ్తున్నాను.", None, ["grammar"]),
                card("నువ్వు", "nuvvu", "You (informal)", None, None, ["grammar"]),
                card("మీరు", "meeru", "You (formal)", None, None, ["grammar"]),
                card("అతను", "athanu", "He", None, None, ["grammar"]),
                card("ఆమె", "aame", "She", None, None, ["grammar"]),
                card("వారు", "vaaru", "They / respectful he or she", None, None, ["grammar"]),
                card("మేము", "memu", "We", None, None, ["grammar"]),
                card("ఇది", "idi", "This", "ఇది నా పుస్తకం.", None, ["grammar"]),
                card("అది", "adi", "That", None, None, ["grammar"]),
                card("ఎవరు", "evaru", "Who", "వారు ఎవరు?", None, ["grammar"]),
                card("ఏమిటి", "emiti", "What", "ఇది ఏమిటి?", None, ["grammar"]),
                card("ఎక్కడ", "ekkada", "Where", "మీరు ఎక్కడ ఉంటారు?", None, ["grammar"]),
                card("ఎప్పుడు", "eppudu", "When", None, None, ["grammar"]),
                card("ఎందుకు", "enduku", "Why", None, None, ["grammar"]),
                card("ఎలా", "elaa", "How", None, None, ["grammar"]),
                card("ఎంత", "entha", "How much / how many", "ఇది ఎంత?", None, ["grammar"]),
            ],
        }
    )

    nums_1_20 = [
        ("ఒకటి", "okati", "One"), ("రెండు", "rendu", "Two"), ("మూడు", "moodu", "Three"),
        ("నాలుగు", "naalugu", "Four"), ("అయిదు", "ayidu", "Five"), ("ఆరు", "aaru", "Six"),
        ("ఏడు", "eedu", "Seven"), ("ఎనిమిది", "enimidi", "Eight"), ("తొమ్మిది", "tommidi", "Nine"),
        ("పది", "padi", "Ten"), ("పదకొండు", "padakondu", "Eleven"), ("పన్నెండు", "pannendu", "Twelve"),
        ("పదమూడు", "padamoodu", "Thirteen"), ("పదనాలుగు", "padanaalugu", "Fourteen"),
        ("పదిహేను", "padihenu", "Fifteen"), ("పదహారు", "padahaaru", "Sixteen"),
        ("పదిహేడు", "padiheedu", "Seventeen"), ("పద్దెనిమిది", "paddenimidi", "Eighteen"),
        ("పంతొమ్మిది", "pantommidi", "Nineteen"), ("ఇరవై", "iravai", "Twenty"),
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
                card("ముప్పై", "muppai", "Thirty", tags=["numbers"]),
                card("నలభై", "nalabhai", "Forty", tags=["numbers"]),
                card("యాభై", "yaabhai", "Fifty", tags=["numbers"]),
                card("అరవై", "aravai", "Sixty", tags=["numbers"]),
                card("డెబ్బై", "debbaai", "Seventy", tags=["numbers"]),
                card("ఎనభై", "enabhai", "Eighty", tags=["numbers"]),
                card("తొంభై", "tombhai", "Ninety", tags=["numbers"]),
                card("వంద", "vanda", "One hundred", tags=["numbers"]),
                card("వేయి", "veyi", "One thousand", tags=["numbers"]),
                card("అన్నీ", "anni", "All", tags=["numbers"]),
                card("కొంచెం", "konchem", "A little / some", tags=["numbers"]),
                card("చాలా", "chaalaa", "Many / a lot", tags=["numbers"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Days, Months & Time",
            "description": "Calendar and telling time",
            "cards": [
                card("ఈరోజు", "eerroju", "Today", tags=["time"]),
                card("రేపు", "repu", "Tomorrow", tags=["time"]),
                card("నిన్న", "ninna", "Yesterday", tags=["time"]),
                card("ఇప్పుడు", "ippudu", "Now", tags=["time"]),
                card("సోమవారం", "somavaaram", "Monday", tags=["time"]),
                card("మంగళవారం", "mangalavaaram", "Tuesday", tags=["time"]),
                card("బుధవారం", "budhavaaram", "Wednesday", tags=["time"]),
                card("గురువారం", "guruvaaram", "Thursday", tags=["time"]),
                card("శుక్రవారం", "shukravaaram", "Friday", tags=["time"]),
                card("శనివారం", "shanivaaram", "Saturday", tags=["time"]),
                card("ఆదివారం", "aadivaaram", "Sunday", tags=["time"]),
                card("జనవరి", "janavari", "January", notes="Gregorian months used in modern Telugu", tags=["time"]),
                card("ఏప్రిల్", "epril", "April", tags=["time"]),
                card("జూలై", "julai", "July", tags=["time"]),
                card("అక్టోబర్", "oktobar", "October", tags=["time"]),
                card("డిసెంబర్", "disembar", "December", tags=["time"]),
                card("గంట", "ganta", "Hour / o'clock", tags=["time"]),
                card("నిమిషం", "nimisham", "Minute", tags=["time"]),
                card("ఉదయం", "udayam", "Morning", tags=["time"]),
                card("సాయంత్రం", "saayanthram", "Evening", tags=["time"]),
                card("రాత్రి", "raatri", "Night", tags=["time"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Family & People",
            "description": "Family members and relationships",
            "cards": [
                card("అమ్మ", "amma", "Mother", tags=["family"]),
                card("నాన్న", "naanna", "Father", tags=["family"]),
                card("అక్క", "akka", "Elder sister", tags=["family"]),
                card("చెల్లి", "chelli", "Younger sister", tags=["family"]),
                card("అన్న", "anna", "Elder brother", tags=["family"]),
                card("తమ్ముడు", "thammudu", "Younger brother", tags=["family"]),
                card("తాత", "thaata", "Grandfather", tags=["family"]),
                card("అమ్మమ్మ", "ammamma", "Grandmother", tags=["family"]),
                card("కొడుకు", "koduku", "Son", tags=["family"]),
                card("కూతురు", "koothuru", "Daughter", tags=["family"]),
                card("భర్త", "bharta", "Husband", tags=["family"]),
                card("భార్య", "bhaarya", "Wife", tags=["family"]),
                card("కుటుంబం", "kutumbam", "Family", tags=["family"]),
                card("స్నేహితుడు", "snehitudu", "Friend (male)", tags=["family"]),
                card("స్నేహితురాలు", "snehituraalu", "Friend (female)", tags=["family"]),
                card("పిల్ల", "pilla", "Child", tags=["family"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Body Parts",
            "description": "Parts of the body",
            "cards": [
                card("తల", "tala", "Head", tags=["body"]),
                card("కన్ను", "kannu", "Eye", tags=["body"]),
                card("చెవి", "chevi", "Ear", tags=["body"]),
                card("ముక్కు", "mukku", "Nose", tags=["body"]),
                card("నోరు", "nooru", "Mouth", tags=["body"]),
                card("చేయి", "cheyi", "Hand", tags=["body"]),
                card("కాలు", "kaalu", "Leg / foot", tags=["body"]),
                card("వేలు", "velu", "Finger", tags=["body"]),
                card("గుండె", "gunde", "Heart", tags=["body"]),
                card("కడుపు", "kadupu", "Stomach / belly", tags=["body"]),
                card("వెనుక", "venuka", "Back", tags=["body"]),
                card("మెడ", "meda", "Neck", tags=["body"]),
                card("ముఖం", "mukham", "Face", tags=["body"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Colors",
            "description": "Common colors",
            "cards": [
                card("ఎరుపు", "erupu", "Red", tags=["colors"]),
                card("నీలం", "neelam", "Blue", tags=["colors"]),
                card("ఆకుపచ్చ", "aakupachcha", "Green", tags=["colors"]),
                card("పసుపు", "pasupu", "Yellow", tags=["colors"]),
                card("నలుపు", "nalupu", "Black", tags=["colors"]),
                card("తెలుపు", "telupu", "White", tags=["colors"]),
                card("నారింజ", "naarinja", "Orange", tags=["colors"]),
                card("ఊదా", "oodaa", "Purple / violet", tags=["colors"]),
                card("గులాబీ", "gulaabi", "Pink", tags=["colors"]),
                card("బూడిద", "boodida", "Gray", tags=["colors"]),
                card("కాఫీ రంగు", "kaafi rangu", "Brown", notes="Literally coffee color", tags=["colors"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Food & Drink",
            "description": "Common food and dining words",
            "cards": [
                card("భోజనం", "bhojanam", "Food / meal", tags=["food"]),
                card("అన్నం", "annam", "Cooked rice / food", notes="General word for a meal", tags=["food"]),
                card("నీరు", "neeru", "Water", tags=["food"]),
                card("పాలు", "paalu", "Milk", tags=["food"]),
                card("టీ", "tee", "Tea", tags=["food"]),
                card("కాఫీ", "kaafi", "Coffee", tags=["food"]),
                card("రొట్టె", "rotte", "Bread / roti", tags=["food"]),
                card("బియ్యం", "biyyam", "Rice (uncooked)", tags=["food"]),
                card("సాంబార్", "saambar", "Sambar", tags=["food"]),
                card("దోస", "dosa", "Dosa", tags=["food"]),
                card("ఇడ్లి", "idli", "Idli", tags=["food"]),
                card("పండు", "pandu", "Fruit", tags=["food"]),
                card("కూరగాయ", "kooragaaya", "Vegetable", tags=["food"]),
                card("మాంసం", "maamsam", "Meat", tags=["food"]),
                card("చేప", "chepa", "Fish", tags=["food"]),
                card("తీపి", "teepi", "Sweet", tags=["food"]),
                card("ఎర్రగా", "erragaa", "Spicy / hot", tags=["food"]),
                card("రుచి", "ruchi", "Taste / flavor", tags=["food"]),
                card("ఆకలి", "aakali", "Hunger / hungry", "ఆకలి వేసింది.", tags=["food"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Home & Objects",
            "description": "Home, rooms, and everyday objects",
            "cards": [
                card("ఇల్లు", "illu", "House / home", tags=["home"]),
                card("గది", "gadi", "Room", tags=["home"]),
                card("వంటగది", "vantagadi", "Kitchen", tags=["home"]),
                card("స్నానగది", "snaanagadi", "Bathroom", tags=["home"]),
                card("తలుపు", "talupu", "Door", tags=["home"]),
                card("కిటికీ", "kitiki", "Window", tags=["home"]),
                card("మంచం", "mancham", "Bed", tags=["home"]),
                card("బల్ల", "balla", "Table", tags=["home"]),
                card("కుర్చీ", "kurchi", "Chair", tags=["home"]),
                card("దీపం", "deepam", "Lamp / light", tags=["home"]),
                card("పుస్తకం", "pustakam", "Book", tags=["home"]),
                card("ఫోన్", "phone", "Phone", tags=["home"]),
                card("తాళం", "thaalam", "Key / lock", tags=["home"]),
                card("సంచి", "sanchi", "Bag", tags=["home"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Clothes",
            "description": "Clothing",
            "cards": [
                card("బట్ట", "batta", "Cloth / clothes", tags=["clothes"]),
                card("చొక్కా", "chokkaa", "Shirt", tags=["clothes"]),
                card("ప్యాంటు", "pyaantu", "Pants", tags=["clothes"]),
                card("చీర", "cheera", "Saree", tags=["clothes"]),
                card("షర్టు", "shirtu", "Shirt", tags=["clothes"]),
                card("బూట్లు", "bootlu", "Shoes", tags=["clothes"]),
                card("టోపీ", "topi", "Hat / cap", tags=["clothes"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Nature & Weather",
            "description": "Nature, animals, and weather",
            "cards": [
                card("సూర్యుడు", "sooryudu", "Sun", tags=["nature"]),
                card("చంద్రుడు", "chandrudu", "Moon", tags=["nature"]),
                card("నక్షత్రం", "nakshatram", "Star", tags=["nature"]),
                card("వర్షం", "varsham", "Rain", tags=["nature"]),
                card("గాలి", "gaali", "Wind", tags=["nature"]),
                card("కొండ", "konda", "Hill / mountain", tags=["nature"]),
                card("నది", "nadi", "River", tags=["nature"]),
                card("సముద్రం", "samudram", "Sea / ocean", tags=["nature"]),
                card("చెట్టు", "chettu", "Tree", tags=["nature"]),
                card("పువ్వు", "puvvu", "Flower", tags=["nature"]),
                card("కుక్క", "kukka", "Dog", tags=["nature"]),
                card("పిల్లి", "pilli", "Cat", tags=["nature"]),
                card("ఆవు", "aavu", "Cow", tags=["nature"]),
                card("పక్షి", "pakshi", "Bird", tags=["nature"]),
                card("వేడ", "veda", "Heat / hot", tags=["nature"]),
                card("చలి", "chali", "Cold", tags=["nature"]),
            ],
        }
    )
    lessons.append(
        {
            "title": "Places & Directions",
            "description": "Places and getting around",
            "cards": [
                card("నగరం", "nagaram", "City", None, None, ["places"]),
                card("గ్రామం", "graamam", "Village", None, None, ["places"]),
                card("రోడ్డు", "roddu", "Road / street", None, None, ["places"]),
                card("ఆసుపత్రి", "aasupatri", "Hospital", None, None, ["places"]),
                card("ఆదుంపం", "adupam", "School", None, None, ["places"]),
                card("అప్పుపికం", "appupikam", "Office", None, None, ["places"]),
                card("సంతపురం", "santapuram", "Market", None, None, ["places"]),
                card("నిలదీం", "niladeem", "Station / stop", None, None, ["places"]),
                card("ఎడం", "edam", "Left", None, None, ["places"]),
                card("బయం", "bayam", "Right", None, None, ["places"]),
                card("నేరం", "neram", "Straight", None, None, ["places"]),
                card("దగ్గరం", "daggar", "Near", None, None, ["places"]),
                card("దూరం", "dooram", "Far", None, None, ["places"]),
                card("ఇక్కడ", "ikkada", "Here", None, None, ["places"]),
                card("అక్కడ", "akkada", "There", None, None, ["places"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Transport",
            "description": "Vehicles and travel",
            "cards": [
                card("బస్సు", "bassu", "Bus", None, None, ["transport"]),
                card("రైలు", "railu", "Train", None, None, ["transport"]),
                card("కారు", "kaaru", "Car", None, None, ["transport"]),
                card("బైక్", "baik", "Bike / motorcycle", None, None, ["transport"]),
                card("సైకిల్", "saikil", "Bicycle", None, None, ["transport"]),
                card("టాక్సీ", "taaksi", "Taxi", None, None, ["transport"]),
                card("విమానం", "vimaanam", "Airplane", None, None, ["transport"]),
                card("టికెట్", "tiket", "Ticket", None, None, ["transport"]),
                card("ప్రయాణం", "prayaanam", "Journey / travel", None, None, ["transport"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Common Verbs",
            "description": "Everyday action verbs",
            "cards": [
                card("వెళ్ళు", "vellu", "Go", "నేను ఇంటికి వెళ్తున్నాను.", None, ["verbs"]),
                card("రా", "raa", "Come", "మీరు రండి.", None, ["verbs"]),
                card("తిను", "tinu", "Eat", None, None, ["verbs"]),
                card("తాగు", "thaagu", "Drink", None, None, ["verbs"]),
                card("చూడు", "choodu", "See / look", None, None, ["verbs"]),
                card("వినవు", "vinavu", "Listen / ask", None, None, ["verbs"]),
                card("మాటలాడు", "maatalaadu", "Speak", None, None, ["verbs"]),
                card("రాయి", "raayi", "Write", None, None, ["verbs"]),
                card("చదువు", "chaduvu", "Read", None, None, ["verbs"]),
                card("నేర్చుకో", "nerchuko", "Learn", None, None, ["verbs"]),
                card("పని", "pani", "Work", None, None, ["verbs"]),
                card("నిద్ర", "nidra", "Sleep", None, None, ["verbs"]),
                card("లేవు", "levu", "Wake up", None, None, ["verbs"]),
                card("నడచు", "nadachu", "Walk", None, None, ["verbs"]),
                card("పరిగే", "parige", "Run", None, None, ["verbs"]),
                card("ఇవ్వు", "ivvu", "Give", None, None, ["verbs"]),
                card("తీసుకో", "teesuko", "Take", None, None, ["verbs"]),
                card("తెలుసుకో", "telusuko", "Know / understand", None, None, ["verbs"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Adjectives & Feelings",
            "description": "Describing things and emotions",
            "cards": [
                card("బాగుంది", "baagundi", "Good / fine", None, None, ["adjectives"]),
                card("చెడు", "chedu", "Bad", None, None, ["adjectives"]),
                card("పెద్ద", "pedda", "Big", None, None, ["adjectives"]),
                card("చిన్న", "chinna", "Small", None, None, ["adjectives"]),
                card("కొత్త", "kotta", "New", None, None, ["adjectives"]),
                card("పాత", "paata", "Old", None, None, ["adjectives"]),
                card("అందం", "andam", "Beautiful", None, None, ["adjectives"]),
                card("సంతోషం", "santosham", "Happy / happiness", None, None, ["adjectives"]),
                card("దుఃఖం", "duhkham", "Sad / sorrow", None, None, ["adjectives"]),
                card("ఆశ", "aasha", "Hope / desire", None, None, ["adjectives"]),
                card("భయం", "bhayam", "Fear", None, None, ["adjectives"]),
                card("వేడి", "vedi", "Hot", None, None, ["adjectives"]),
                card("చలిపని", "chalipani", "Cool", None, None, ["adjectives"]),
                card("చాలా", "chaalaa", "Very / a lot", None, None, ["adjectives"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Useful Phrases",
            "description": "High-frequency sentences for daily life",
            "cards": [
                card("నాకు అర్థం కాదు", "naaku artham kaadu", "I don't understand", None, None, ["phrases"]),
                card("దయచేసి నిధానంగా మాటలాడండి", "dayacheesi nidhaanamgaa maatalaandandi", "Please speak slowly", None, None, ["phrases"]),
                card("ఇది ఎంత", "idi entha", "How much is this?", None, None, ["phrases"]),
                card("మీరు ఇంగ్లీష్ మాటలాడతారా?", "meeru inglish maatalaadataara?", "Do you speak English?", None, None, ["phrases"]),
                card("నాకు సహాయం కావాలి", "naaku sahaayam kaavali", "I need help", None, None, ["phrases"]),
                card("ఆపాయము ఎక్కడ", "aapaayamu ekkada", "Where is the restroom?", None, None, ["phrases"]),
                card("నేను తిప్పుకున్నాను", "nenu tippukunnaanu", "I am lost", None, None, ["phrases"]),
                card("ఒక నిమిషం", "oka nimisham", "One moment", None, None, ["phrases"]),
                card("మళ్లీ చేపండి", "mallee cheppandi", "Say it again", None, None, ["phrases"]),
                card("సరే", "sare", "Okay / correct", None, None, ["phrases"]),
                card("సమయం అయింది", "samayam ayindi", "Time is up / it's late", None, None, ["phrases"]),
                card("ఆమాయము మంచి రోజు", "aamaayamu manchi roju", "Have a good day", None, None, ["phrases"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Telugu Culture & States",
            "description": "Language, states, and cultural context",
            "cards": [
                card("తెలుగు", "telugu", "Telugu (language)", None, None, ["culture"]),
                card("ఆంధ్రప్రదేశం", "andhrapradesham", "Andhra Pradesh (state)", None, None, ["culture"]),
                card("తెలంగాణం", "telangaana", "Telangana (state)", None, None, ["culture"]),
                card("హైదరాబాదు", "hyderabad", "Hyderabad", None, None, ["culture"]),
                card("విజయవాడ", "vijayavaada", "Vijayawada", None, None, ["culture"]),
                card("ఉగాది", "ugaadi", "Telugu New Year festival", None, None, ["culture"]),
                card("సంక్రాంతం", "sankraantham", "Sankranti festival", None, None, ["culture"]),
                card("కర్నాటక సంగీతం", "karnataka sangeetam", "Carnatic music tradition", None, None, ["culture"]),
                card("తెలుగు సాహిత్యం", "telugu saahityam", "Telugu literature", None, None, ["culture"]),
                card("రాష్ట్ర భాష", "raashtra bhaasha", "State language", None, None, ["culture"]),
                card("ప్రాచీన భాష", "praachina bhaasha", "Classical language", None, None, ["culture"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Money & Shopping",
            "description": "Buying, selling, and money",
            "cards": [
                card("డాబు", "daabu", "Money", None, None, ["shopping"]),
                card("ధర", "dhara", "Price", None, None, ["shopping"]),
                card("కొణుగు", "konugu", "Purchase / buy", None, None, ["shopping"]),
                card("అమ్మకం", "ammakam", "Sale / sell", None, None, ["shopping"]),
                card("రూపాయి", "roopaayi", "Rupee", None, None, ["shopping"]),
                card("దోరుకుంది", "dorukundi", "Available / you get", None, None, ["shopping"]),
                card("కావాలి", "kaavali", "Want / need", None, None, ["shopping"]),
                card("వద్దు", "vaddu", "Don't want / not needed", None, None, ["shopping"]),
                card("దుకానం", "dukaanam", "Shop / store", None, None, ["shopping"]),
                card("బిల్లు", "billu", "Bill / receipt", None, None, ["shopping"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Health & Emergencies",
            "description": "Health, doctor, and emergency phrases",
            "cards": [
                card("ఆరోగ్యం", "aarogyam", "Health", None, None, ["health"]),
                card("వైద్యుడు", "vaidyudu", "Doctor", None, None, ["health"]),
                card("మందు", "mandu", "Medicine", None, None, ["health"]),
                card("నోపి", "nopi", "Pain", None, None, ["health"]),
                card("జ్వరం", "jwaram", "Fever", None, None, ["health"]),
                card("ఆసుపత్రికి కాల్ చేయంది", "aasupatrikiki kaal cheyandi", "Call the hospital", None, None, ["health"]),
                card("నాకు నోపం వస్తుంది", "naaku noppi vastundi", "I am in pain / it hurts", None, None, ["health"]),
                card("అపాయం", "apaayam", "Danger", None, None, ["health"]),
                card("సహాయం", "sahaayam", "Help", None, None, ["health"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Work & Occupations",
            "description": "Jobs and workplace words",
            "cards": [
                card("ఉద్యోగం", "udyogam", "Job / employment", None, None, ["work"]),
                card("విద్యార్థి", "vidyaarthi", "Student", None, None, ["work"]),
                card("అధ్యాపకుడు", "adhyaapakudu", "Teacher (male)", None, None, ["work"]),
                card("అధ్యాపకురాలు", "adhyaapakuraalu", "Teacher (female)", None, None, ["work"]),
                card("ఇంజనీరు", "injiniyaru", "Engineer", None, None, ["work"]),
                card("వ్యాపారుడు", "vyaapaarudu", "Businessperson / merchant", None, None, ["work"]),
                card("రైతు", "raitu", "Farmer", None, None, ["work"]),
                card("అప్పుపికం", "appupikam", "Office", None, None, ["work"]),
                card("సభ", "sabha", "Meeting", None, None, ["work"]),
            ],
        }
    )

    lessons.append(
        {
            "title": "Grammar Essentials",
            "description": "Postpositions, conjunctions, and sentence glue",
            "cards": [
                card("మరియు", "mariyu", "And", None, None, ["grammar"]),
                card("కానీ", "kaani", "But", None, None, ["grammar"]),
                card("లేదా", "ledaa", "Or", None, None, ["grammar"]),
                card("ఎందుకంటే", "endukante", "Because", None, None, ["grammar"]),
                card("నుంది", "nundi", "From / since", None, None, ["grammar"]),
                card("కు", "ku", "To / for (dative suffix)", None, "Used after nouns", ["grammar"]),
                card("లో", "lo", "In / at (locative suffix)", None, "Used after nouns", ["grammar"]),
                card("లేదు", "ledu", "Not / there isn't", None, "Same word as 'no' in many contexts", ["grammar"]),
                card("ఉంది", "undi", "Is / exists", None, None, ["grammar"]),
                card("కదు", "kada", "Isn't it? / right?", None, None, ["grammar"]),
                card("చాలా", "chaalaa", "Very / much", None, None, ["grammar"]),
                card("ఇంకా", "inka", "Still / yet / more", None, None, ["grammar"]),
            ],
        }
    )

    deck = {
        "deck": {
            "title": "Telugu",
            "description": "Comprehensive Telugu foundation: greetings, grammar, numbers, family, food, travel, verbs, phrases, and culture. Front shows Telugu with romanization; back shows English.",
            "language": "Telugu",
            "tags": ["telugu", "language", "basics", "india", "andhra", "telangana"],
        },
        "lessons": lessons,
    }

    out = Path(__file__).parent / "telugu-basics.json"
    out.write_text(json.dumps(deck, ensure_ascii=False, indent=2), encoding="utf-8")

    total_cards = sum(len(l["cards"]) for l in lessons)
    print(f"Wrote {out}")
    print(f"Lessons: {len(lessons)}, Cards: {total_cards}")


if __name__ == "__main__":
    main()
