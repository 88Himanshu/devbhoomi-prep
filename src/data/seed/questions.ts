import type { Difficulty, OptionKey, Question } from "@/lib/types";
import { daysAgo } from "./constants";

type Opts = [string, string, string, string];

let counter = 0;
const rows: Question[] = [];

/** Compact question builder. Ids are assigned sequentially in file order (q_0001, q_0002, …). */
function q(
  subject: string,
  text: string,
  opts: Opts,
  correct: OptionKey,
  explanation: string,
  difficulty: Difficulty,
  exam: string | null = null,
  year: number | null = null,
): void {
  counter += 1;
  rows.push({
    id: `q_${String(counter).padStart(4, "0")}`,
    text,
    option_a: opts[0],
    option_b: opts[1],
    option_c: opts[2],
    option_d: opts[3],
    correct_option: correct,
    explanation,
    subject_id: subject,
    exam_id: exam,
    year,
    difficulty,
    marks: 1,
    negative_marks: subject === "sub_pedagogy" ? 0 : 0.25,
    language: subject === "sub_hindi" ? "hi" : "en",
    is_active: true,
    created_at: daysAgo(120 + (counter % 60)),
  });
}

const UK = "sub_uk_gk";
const GS = "sub_gs";
const CA = "sub_current";
const HI = "sub_hindi";
const EN = "sub_english";
const MA = "sub_math";
const RE = "sub_reasoning";
const CO = "sub_computer";
const PE = "sub_pedagogy";
const EV = "sub_env";

/* ------------------------------------------------------------------ */
/* Uttarakhand GK (q_0001 – q_0070)                                    */
/* ------------------------------------------------------------------ */
q(UK, "On which date was Uttarakhand formed as a separate state of India?", ["1 November 2000", "9 November 2000", "15 November 2000", "26 January 2001"], "B", "Uttarakhand was carved out of Uttar Pradesh on 9 November 2000 as the 27th state of India. 9 November is celebrated as Uttarakhand Foundation Day.", "easy", "exam_uksssc", 2021);
q(UK, "Uttarakhand was originally named 'Uttaranchal'. In which year was it officially renamed Uttarakhand?", ["2002", "2005", "2007", "2010"], "C", "The Uttaranchal (Alteration of Name) Act, 2006 came into effect on 1 January 2007, renaming the state Uttarakhand.", "easy", "exam_police", 2022);
q(UK, "Which town was declared the summer capital of Uttarakhand in 2020?", ["Nainital", "Gairsain (Bhararisain)", "Almora", "Srinagar"], "B", "Bhararisain near Gairsain in Chamoli district was declared the summer capital in March 2020. Dehradun remains the winter capital.", "easy", "exam_uksssc", 2022);
q(UK, "How many districts does Uttarakhand have?", ["11", "12", "13", "14"], "C", "Uttarakhand has 13 districts: 7 in Garhwal division and 6 in Kumaon division.", "easy", "exam_patwari", 2023);
q(UK, "Which of the following districts belongs to the Kumaon division?", ["Chamoli", "Tehri Garhwal", "Bageshwar", "Rudraprayag"], "C", "Kumaon division comprises Almora, Bageshwar, Champawat, Nainital, Pithoragarh and Udham Singh Nagar. The rest are in Garhwal.", "easy", "exam_vdo", 2023);
q(UK, "Which is the highest peak located entirely within Uttarakhand?", ["Kamet", "Trishul", "Nanda Devi", "Chaukhamba"], "C", "Nanda Devi (7,816 m) is the highest peak entirely within India and lies in Chamoli district of Uttarakhand.", "easy", "exam_ukpsc", 2021);
q(UK, "What is the state animal of Uttarakhand?", ["Snow leopard", "Alpine musk deer", "Himalayan black bear", "Bharal"], "B", "The Alpine musk deer (Kasturi Mrig) is the state animal. The state bird is the Himalayan monal, the state flower is Brahma Kamal and the state tree is Burans.", "easy", "exam_forest_guard", 2022);
q(UK, "Which flower is the state flower of Uttarakhand?", ["Rhododendron", "Brahma Kamal", "Lotus", "Marigold"], "B", "Brahma Kamal (Saussurea obvallata) is the state flower. Burans (Rhododendron arboreum) is the state tree.", "easy", "exam_forest_guard", 2021);
q(UK, "Jim Corbett National Park was originally established in 1936 under which name?", ["Ramganga National Park", "Hailey National Park", "Rajaji National Park", "Kalagarh National Park"], "B", "It was established as Hailey National Park in 1936, India's first national park. It was renamed after Jim Corbett in 1957.", "medium", "exam_forest_guard", 2022);
q(UK, "The Valley of Flowers National Park is located in which district?", ["Uttarkashi", "Pithoragarh", "Chamoli", "Rudraprayag"], "C", "The Valley of Flowers lies in Chamoli district and, together with Nanda Devi National Park, forms a UNESCO World Heritage Site.", "easy", "exam_uksssc", 2021);
q(UK, "The Chipko movement of the 1970s is most closely associated with which village of Chamoli district?", ["Mandal and Reni", "Gopeshwar", "Joshimath", "Karnaprayag"], "A", "Chipko began at Mandal village in 1973 and its most famous action took place at Reni in March 1974, led by Gaura Devi.", "medium", "exam_ukpsc", 2019);
q(UK, "Who led the women of Reni village during the Chipko protest of 1974?", ["Bachni Devi", "Gaura Devi", "Sarla Behn", "Bimla Bahuguna"], "B", "Gaura Devi led 27 women who hugged trees to stop felling at Reni, near Joshimath, in March 1974.", "easy", "exam_police", 2021);
q(UK, "Tehri Dam is built on which river?", ["Alaknanda", "Bhagirathi", "Mandakini", "Yamuna"], "B", "Tehri Dam, one of the tallest dams in India (260.5 m), is built on the Bhagirathi river near Tehri town.", "easy", "exam_uksssc", 2022);
q(UK, "At which confluence do the Bhagirathi and Alaknanda rivers meet to form the Ganga?", ["Rudraprayag", "Karnaprayag", "Devprayag", "Vishnuprayag"], "C", "The Bhagirathi and Alaknanda meet at Devprayag in Tehri Garhwal district; from here the river is called the Ganga.", "easy", "exam_patwari", 2022);
q(UK, "The Mandakini river joins the Alaknanda at which of the Panch Prayag?", ["Nandprayag", "Rudraprayag", "Karnaprayag", "Vishnuprayag"], "B", "The Mandakini, which flows from Kedarnath, meets the Alaknanda at Rudraprayag. Karnaprayag is the confluence with the Pindar.", "medium", "exam_ukpsc", 2020);
q(UK, "The Pindar river meets the Alaknanda at:", ["Karnaprayag", "Nandprayag", "Devprayag", "Rudraprayag"], "A", "Karnaprayag is the confluence of the Pindar and Alaknanda. Nandprayag is the confluence with the Nandakini.", "medium", "exam_uksssc", 2019);
q(UK, "The Gangotri glacier, the source of the Bhagirathi, is located in which district?", ["Chamoli", "Uttarkashi", "Rudraprayag", "Tehri Garhwal"], "B", "Gangotri glacier, whose snout is called Gaumukh, lies in Uttarkashi district.", "easy", "exam_police", 2022);
q(UK, "Kedarnath temple is situated in which district of Uttarakhand?", ["Chamoli", "Rudraprayag", "Uttarkashi", "Pauri Garhwal"], "B", "Kedarnath, one of the twelve Jyotirlingas, lies in Rudraprayag district on the banks of the Mandakini.", "easy", "exam_vdo", 2023);
q(UK, "Badrinath temple lies on the banks of which river?", ["Bhagirathi", "Mandakini", "Alaknanda", "Dhauliganga"], "C", "Badrinath, in Chamoli district, is situated on the banks of the Alaknanda river between the Nar and Narayan ranges.", "easy", "exam_uksssc", 2021);
q(UK, "The Nanda Devi Raj Jat Yatra is traditionally held once every:", ["6 years", "10 years", "12 years", "15 years"], "C", "The Nanda Devi Raj Jat, a roughly 280-km pilgrimage starting from Nauti village, is held once every 12 years.", "medium", "exam_ukpsc", 2018);
q(UK, "'Chholiya' is a traditional sword dance of which region?", ["Jaunsar-Bawar", "Kumaon", "Garhwal", "Terai"], "B", "Chholiya is a martial sword-and-shield dance of the Kumaon region, traditionally performed at weddings.", "easy", "exam_police", 2021);
q(UK, "The 'Pandav Nritya' folk dance narrating the Mahabharata is popular in which region?", ["Kumaon", "Garhwal", "Bhabar", "Jaunsar"], "B", "Pandav Nritya is a ritual dance-drama of Garhwal depicting episodes from the Mahabharata.", "medium", "exam_uksssc", 2018);
q(UK, "Roopkund, famous for the human skeletons found at its lake, is in which district?", ["Bageshwar", "Chamoli", "Pithoragarh", "Almora"], "B", "Roopkund lake lies at about 5,000 m in Chamoli district, near the Trishul massif.", "medium", "exam_forest_guard", 2022);
q(UK, "Rajaji National Park is named after:", ["Raja Ram Mohan Roy", "C. Rajagopalachari", "Rajendra Prasad", "Raja Mahendra Pratap"], "B", "Rajaji National Park (established 1983) is named after C. Rajagopalachari, the last Governor-General of India.", "easy", "exam_forest_guard", 2021);
q(UK, "Which national park of Uttarakhand lies in Uttarkashi district and is known for snow leopards?", ["Nanda Devi National Park", "Gangotri National Park", "Rajaji National Park", "Corbett National Park"], "B", "Gangotri National Park (established 1989) is in Uttarkashi district and is an important snow leopard habitat.", "medium", "exam_forest_guard", 2023);
q(UK, "Which district of Uttarakhand has the largest geographical area?", ["Uttarkashi", "Pithoragarh", "Chamoli", "Pauri Garhwal"], "C", "Chamoli (about 8,030 sq km) is the largest district by area, marginally ahead of Uttarkashi.", "medium", "exam_ukpsc", 2021);
q(UK, "Which is the smallest district of Uttarakhand by area?", ["Champawat", "Bageshwar", "Rudraprayag", "Udham Singh Nagar"], "A", "Champawat, with about 1,766 sq km, is the smallest district by area.", "medium", "exam_uksssc", 2022);
q(UK, "According to Census 2011, which district of Uttarakhand has the highest population?", ["Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital"], "B", "Haridwar (about 18.9 lakh) is the most populous district, followed by Dehradun and Udham Singh Nagar.", "medium", "exam_patwari", 2023);
q(UK, "The High Court of Uttarakhand is located at:", ["Dehradun", "Haridwar", "Nainital", "Haldwani"], "C", "The Uttarakhand High Court was established at Nainital on 9 November 2000.", "easy", "exam_police", 2022);
q(UK, "Who was the first Chief Minister of Uttarakhand (then Uttaranchal)?", ["Bhagat Singh Koshyari", "Nityanand Swami", "N. D. Tiwari", "B. C. Khanduri"], "B", "Nityanand Swami was the first Chief Minister (November 2000 – October 2001). Surjit Singh Barnala was the first Governor.", "easy", "exam_uksssc", 2021);
q(UK, "Who was the first Governor of Uttarakhand?", ["Sudarshan Agarwal", "Surjit Singh Barnala", "Margaret Alva", "B. L. Joshi"], "B", "Surjit Singh Barnala served as the first Governor from November 2000 to January 2003.", "medium", "exam_vdo", 2022);
q(UK, "The Katarmal Sun Temple is located in which district?", ["Almora", "Bageshwar", "Pithoragarh", "Champawat"], "A", "The 9th-century Katarmal Surya Temple, built by the Katyuri kings, is near Almora.", "medium", "exam_ukpsc", 2019);
q(UK, "The Jageshwar group of temples, dedicated to Lord Shiva, is in which district?", ["Almora", "Chamoli", "Nainital", "Rudraprayag"], "A", "Jageshwar, a cluster of over 100 stone temples, is located in Almora district.", "easy", "exam_uksssc", 2020);
q(UK, "Baijnath temple, on the banks of the Gomti river, is located in which district?", ["Almora", "Bageshwar", "Pithoragarh", "Champawat"], "B", "Baijnath (ancient Kartikeyapura) in Bageshwar district was a capital of the Katyuri dynasty.", "medium", "exam_ukpsc", 2020);
q(UK, "Mahatma Gandhi called which hill station the 'Switzerland of India'?", ["Mussoorie", "Kausani", "Ranikhet", "Lansdowne"], "B", "Gandhi stayed at Kausani in 1929 and wrote his commentary on the Gita, 'Anasakti Yoga', there.", "easy", "exam_police", 2021);
q(UK, "The Hindi poet Sumitranandan Pant was born at:", ["Almora", "Kausani", "Nainital", "Pithoragarh"], "B", "Sumitranandan Pant, a leading poet of the Chhayavad movement and Jnanpith awardee, was born in Kausani in 1900.", "medium", "exam_uksssc", 2019);
q(UK, "The Tilari (Rawain) massacre of 1930 took place in which princely state?", ["Tehri Garhwal", "Kumaon", "Sirmaur", "Garhwal"], "A", "On 30 May 1930, forces of the Tehri Garhwal state fired on peasants protesting forest laws at Tilari maidan in Rawain.", "hard", "exam_ukpsc", 2018);
q(UK, "The Coolie Begar movement of 1921, in which registers of forced labour were thrown into the river, was centred at:", ["Almora", "Bageshwar", "Haldwani", "Pithoragarh"], "B", "On 14 January 1921 (Uttarayani mela), people led by Badri Datt Pandey threw begar registers into the Saryu at Bageshwar.", "medium", "exam_uksssc", 2021);
q(UK, "Who is known as 'Kumaon Kesari'?", ["Govind Ballabh Pant", "Badri Datt Pandey", "Hargovind Pant", "Anusuya Prasad Bahuguna"], "B", "Badri Datt Pandey, leader of the Coolie Begar movement, earned the title Kumaon Kesari. Anusuya Prasad Bahuguna is called Garhwal Kesari.", "easy", "exam_police", 2022);
q(UK, "The Khatima firing during the Uttarakhand statehood movement took place on:", ["1 September 1994", "2 October 1994", "9 November 1994", "15 August 1994"], "A", "Police fired on statehood protesters at Khatima on 1 September 1994; the Rampur Tiraha (Muzaffarnagar) incident followed on 2 October 1994.", "medium", "exam_uksssc", 2022);
q(UK, "The Regimental Centre of the Kumaon Regiment is at:", ["Lansdowne", "Ranikhet", "Almora", "Dehradun"], "B", "The Kumaon Regimental Centre is at Ranikhet; the Garhwal Rifles Regimental Centre is at Lansdowne.", "easy", "exam_police", 2021);
q(UK, "Veer Chandra Singh Garhwali is remembered for refusing to fire on unarmed protesters in 1930 at:", ["Lahore", "Peshawar", "Amritsar", "Rawalpindi"], "B", "On 23 April 1930, Garhwali soldiers under Chandra Singh Garhwali refused to fire on Pathan protesters at Peshawar.", "medium", "exam_ukpsc", 2019);
q(UK, "The princely state of Tehri Garhwal merged with the Indian Union on:", ["15 August 1947", "1 August 1949", "26 January 1950", "9 November 1949"], "B", "After the Praja Mandal movement, Tehri Garhwal merged with India on 1 August 1949 and became part of Uttar Pradesh.", "hard", "exam_ukpsc", 2020);
q(UK, "Which dynasty shifted its capital from Champawat to Almora in the 16th century?", ["Katyuri", "Chand", "Panwar", "Gorkha"], "B", "Raja Balo Kalyan Chand of the Chand dynasty founded Almora as the capital in 1563.", "medium", "exam_uksssc", 2020);
q(UK, "Gorkha rule over Kumaon and Garhwal ended with which treaty?", ["Treaty of Amritsar", "Treaty of Sugauli", "Treaty of Lahore", "Treaty of Bassein"], "B", "The Treaty of Sugauli (signed 1815, ratified 1816) ended the Anglo-Nepal war and Gorkha control over the region.", "medium", "exam_ukpsc", 2021);
q(UK, "Which river forms the eastern boundary of Uttarakhand with Nepal?", ["Ramganga", "Kali (Sharda)", "Kosi", "Gori Ganga"], "B", "The Kali river, known as the Sharda in the plains, forms the border with Nepal along Pithoragarh and Champawat.", "easy", "exam_patwari", 2022);
q(UK, "Pindari glacier is located in which district?", ["Chamoli", "Bageshwar", "Pithoragarh", "Uttarkashi"], "B", "Pindari glacier, source of the Pindar river, lies in Bageshwar district.", "medium", "exam_forest_guard", 2022);
q(UK, "Milam glacier, source of the Gori Ganga, is located in which district?", ["Pithoragarh", "Bageshwar", "Chamoli", "Almora"], "A", "Milam glacier lies in the Munsiyari region of Pithoragarh district.", "medium", "exam_uksssc", 2021);
q(UK, "Who is credited with 'discovering' Nainital for the British in 1841?", ["Henry Ramsay", "P. Barron", "G. W. Traill", "Jim Corbett"], "B", "P. Barron, a sugar merchant from Shahjahanpur, visited Nainital in 1841 and popularised it as a hill station.", "medium", "exam_ukpsc", 2019);
q(UK, "Which is the largest natural lake of the Kumaon region?", ["Nainital", "Bhimtal", "Sattal", "Naukuchiatal"], "B", "Bhimtal is the largest lake in Kumaon. Naukuchiatal is known for its nine corners.", "easy", "exam_police", 2022);
q(UK, "Mussoorie, the 'Queen of Hills', was founded in 1823 by:", ["Captain Young", "Colonel Everest", "Lord Dalhousie", "Sir Henry Ramsay"], "A", "Captain Frederick Young of the Sirmaur Battalion built the first hunting lodge at Mussoorie in 1823.", "medium", "exam_uksssc", 2019);
q(UK, "The Ashokan rock edict in Uttarakhand is found at:", ["Lakhamandal", "Kalsi", "Haridwar", "Kotdwar"], "B", "The 3rd-century BCE Ashokan rock edict is at Kalsi in Dehradun district, near the Yamuna.", "medium", "exam_ukpsc", 2021);
q(UK, "The Forest Research Institute (FRI) is located at:", ["Nainital", "Dehradun", "Haldwani", "Ranikhet"], "B", "FRI, established in 1906 as the Imperial Forest Research Institute, is in Dehradun.", "easy", "exam_forest_guard", 2021);
q(UK, "The Indian Military Academy (IMA) at Dehradun was established in:", ["1922", "1932", "1947", "1950"], "B", "IMA was established on 1 October 1932; Field Marshal Sam Manekshaw was among its first batch.", "medium", "exam_police", 2022);
q(UK, "G. B. Pant University of Agriculture and Technology, India's first agricultural university, is located at:", ["Haldwani", "Pantnagar", "Rudrapur", "Roorkee"], "B", "Established in 1960 at Pantnagar (Udham Singh Nagar), it was the first agricultural university in India.", "easy", "exam_uksssc", 2021);
q(UK, "The Thomason College of Civil Engineering, now IIT Roorkee, was founded in:", ["1847", "1857", "1901", "1947"], "A", "Founded in 1847, it is the oldest technical institution in Asia and became IIT Roorkee in 2001.", "medium", "exam_ukpsc", 2020);
q(UK, "Golu Devta, the god of justice in Kumaon, has his most famous temple at:", ["Chitai (Almora)", "Jageshwar", "Kainchi Dham", "Devidhura"], "A", "The Chitai Golu Devta temple near Almora is famous for petitions and bells offered by devotees.", "easy", "exam_police", 2021);
q(UK, "The 'Bagwal' fair, involving a ritual stone-throwing on Raksha Bandhan, is held at:", ["Jauljibi", "Devidhura", "Bageshwar", "Thal"], "B", "Bagwal is held at the Barahi Devi temple, Devidhura, in Champawat district.", "medium", "exam_uksssc", 2022);
q(UK, "Harela, a festival marking the arrival of the monsoon and sowing, is mainly celebrated in:", ["Garhwal", "Kumaon", "Jaunsar", "Terai"], "B", "Harela is a Kumaoni festival celebrated in the month of Shravan; Uttarakhand also observes it as a tree-plantation day.", "easy", "exam_vdo", 2023);
q(UK, "The Uttarayani mela is held every January at which town?", ["Almora", "Bageshwar", "Pithoragarh", "Ranikhet"], "B", "The Uttarayani mela at Bageshwar, held on Makar Sankranti, was also the site of the 1921 Coolie Begar protest.", "easy", "exam_police", 2022);
q(UK, "Which language was declared the second official language of Uttarakhand in 2010?", ["Garhwali", "Kumaoni", "Sanskrit", "Urdu"], "C", "Uttarakhand made Sanskrit its second official language in January 2010.", "medium", "exam_uksssc", 2021);
q(UK, "Hemkund Sahib, a Sikh shrine at about 4,300 m, is located in which district?", ["Uttarkashi", "Chamoli", "Rudraprayag", "Pithoragarh"], "B", "Hemkund Sahib, associated with Guru Gobind Singh, is in Chamoli district near the Valley of Flowers.", "easy", "exam_police", 2021);
q(UK, "Piran Kaliyar Sharif, a well-known dargah, is near which town?", ["Haridwar", "Roorkee", "Kashipur", "Rishikesh"], "B", "The dargah of Alauddin Ali Ahmed Sabir Kaliyari is at Kaliyar near Roorkee in Haridwar district.", "medium", "exam_uksssc", 2020);
q(UK, "Which three districts of Uttarakhand were created in 1997?", ["Champawat, Rudraprayag, Bageshwar", "Udham Singh Nagar, Champawat, Haridwar", "Rudraprayag, Uttarkashi, Bageshwar", "Champawat, Pithoragarh, Bageshwar"], "A", "Champawat, Rudraprayag and Bageshwar were created in 1997; Udham Singh Nagar was created in 1995.", "hard", "exam_ukpsc", 2019);
q(UK, "Auli, a popular skiing destination, is in which district?", ["Uttarkashi", "Chamoli", "Bageshwar", "Rudraprayag"], "B", "Auli, near Joshimath in Chamoli district, hosts national winter games and has a long cable car from Joshimath.", "easy", "exam_police", 2022);
q(UK, "How many seats are there in the Uttarakhand Legislative Assembly?", ["60", "70", "71", "80"], "B", "The Uttarakhand Vidhan Sabha has 70 elected seats (plus one nominated Anglo-Indian seat until 2020).", "easy", "exam_patwari", 2023);
q(UK, "Uttarakhand sends how many members to the Lok Sabha?", ["3", "4", "5", "6"], "C", "Uttarakhand has 5 Lok Sabha constituencies (Tehri, Garhwal, Almora, Nainital-Udham Singh Nagar, Haridwar) and 3 Rajya Sabha seats.", "easy", "exam_uksssc", 2022);
q(UK, "According to Census 2011, the literacy rate of Uttarakhand was approximately:", ["68%", "74%", "79%", "85%"], "C", "Uttarakhand recorded a literacy rate of 78.82% in Census 2011 (male 87.4%, female 70%).", "medium", "exam_vdo", 2023);
q(UK, "The 'Maiti' movement, in which a bride plants a sapling at her wedding, was started by:", ["Sunderlal Bahuguna", "Kalyan Singh Rawat", "Chandi Prasad Bhatt", "Vijay Jardhari"], "B", "Kalyan Singh Rawat, a teacher from Chamoli, started the Maiti movement in the 1990s. Vijay Jardhari started Beej Bachao Andolan.", "hard", "exam_ukpsc", 2021);
q(UK, "Which of the following is NOT a Scheduled Tribe of Uttarakhand?", ["Tharu", "Jaunsari", "Bhotia", "Gond"], "D", "Uttarakhand's Scheduled Tribes are Tharu, Jaunsari, Bhotia, Buksa and Raji. Gond is not among them.", "medium", "exam_uksssc", 2021);
q(UK, "The Nanakmatta Sahib gurudwara is located in which district?", ["Haridwar", "Udham Singh Nagar", "Nainital", "Dehradun"], "B", "Nanakmatta, associated with Guru Nanak's visit, is in Udham Singh Nagar district near Khatima.", "medium", "exam_police", 2021);

/* ------------------------------------------------------------------ */
/* General Studies (q_0071 – q_0100)                                   */
/* ------------------------------------------------------------------ */
q(GS, "The Constitution of India was adopted by the Constituent Assembly on:", ["15 August 1947", "26 November 1949", "26 January 1950", "9 December 1946"], "B", "The Constitution was adopted on 26 November 1949 (Constitution Day) and came into force on 26 January 1950.", "easy", "exam_uksssc", 2021);
q(GS, "Which Article of the Constitution guarantees the Right to Life and Personal Liberty?", ["Article 14", "Article 19", "Article 21", "Article 32"], "C", "Article 21 states that no person shall be deprived of life or personal liberty except according to procedure established by law.", "easy", "exam_police", 2022);
q(GS, "Dr. B. R. Ambedkar described which Article as the 'heart and soul' of the Constitution?", ["Article 14", "Article 21", "Article 32", "Article 368"], "C", "Article 32 (right to constitutional remedies) was called the heart and soul of the Constitution by Ambedkar.", "medium", "exam_ukpsc", 2020);
q(GS, "Fundamental Duties were added to the Constitution by which amendment?", ["42nd Amendment, 1976", "44th Amendment, 1978", "73rd Amendment, 1992", "86th Amendment, 2002"], "A", "The 42nd Amendment (1976) added Part IV-A (Article 51A) on Fundamental Duties, following the Swaran Singh Committee.", "medium", "exam_uksssc", 2022);
q(GS, "The 73rd Constitutional Amendment Act is related to:", ["Municipalities", "Panchayati Raj", "Anti-defection", "GST"], "B", "The 73rd Amendment (1992) gave constitutional status to Panchayati Raj institutions (Part IX, Article 243).", "easy", "exam_vdo", 2023);
q(GS, "Who is the constitutional head of a state in India?", ["Chief Minister", "Governor", "Speaker", "Chief Justice of High Court"], "B", "Under Article 153, the Governor is the constitutional head of the state; the Chief Minister heads the Council of Ministers.", "easy", "exam_patwari", 2023);
q(GS, "The Goods and Services Tax (GST) came into force in India on:", ["1 April 2016", "1 July 2017", "1 January 2018", "1 April 2017"], "B", "GST was launched on 1 July 2017 through the 101st Constitutional Amendment.", "easy", "exam_uksssc", 2021);
q(GS, "The Reserve Bank of India was established in:", ["1921", "1935", "1947", "1949"], "B", "RBI was established on 1 April 1935 under the RBI Act, 1934 and nationalised in 1949.", "easy", "exam_police", 2022);
q(GS, "NITI Aayog replaced which body in 2015?", ["Finance Commission", "Planning Commission", "National Development Council", "Economic Advisory Council"], "B", "NITI Aayog was formed on 1 January 2015, replacing the Planning Commission set up in 1950.", "easy", "exam_uksssc", 2022);
q(GS, "The First Battle of Panipat (1526) was fought between Babur and:", ["Rana Sanga", "Ibrahim Lodi", "Hemu", "Sher Shah Suri"], "B", "Babur defeated Ibrahim Lodi at Panipat in 1526, founding the Mughal empire. Rana Sanga was defeated at Khanwa in 1527.", "easy", "exam_police", 2021);
q(GS, "The Battle of Plassey (1757) was won by the British under:", ["Robert Clive", "Warren Hastings", "Lord Wellesley", "Lord Cornwallis"], "A", "Robert Clive defeated Siraj-ud-Daulah at Plassey in 1757, marking the start of British political control in Bengal.", "easy", "exam_uksssc", 2020);
q(GS, "The Jallianwala Bagh massacre took place in the year:", ["1917", "1919", "1921", "1930"], "B", "On 13 April 1919 troops under General Dyer fired on a gathering at Jallianwala Bagh, Amritsar.", "easy", "exam_patwari", 2022);
q(GS, "The Dandi March led by Mahatma Gandhi began on:", ["26 January 1930", "12 March 1930", "6 April 1930", "8 August 1942"], "B", "Gandhi began the Salt March from Sabarmati Ashram on 12 March 1930 and broke the salt law at Dandi on 6 April.", "medium", "exam_ukpsc", 2019);
q(GS, "The Quit India movement was launched in:", ["1940", "1942", "1945", "1947"], "B", "The Quit India resolution was passed on 8 August 1942 at the Bombay session of the Congress.", "easy", "exam_police", 2022);
q(GS, "The Indian National Congress was founded in 1885 by:", ["W. C. Bonnerjee", "A. O. Hume", "Dadabhai Naoroji", "Surendranath Banerjee"], "B", "A. O. Hume, a retired civil servant, founded the INC in 1885; W. C. Bonnerjee was its first president.", "easy", "exam_uksssc", 2021);
q(GS, "Which Harappan site is famous for its dockyard?", ["Mohenjo-daro", "Lothal", "Kalibangan", "Dholavira"], "B", "Lothal in Gujarat had a large brick dockyard, indicating maritime trade.", "medium", "exam_ukpsc", 2020);
q(GS, "Deficiency of Vitamin C causes which disease?", ["Rickets", "Scurvy", "Beriberi", "Night blindness"], "B", "Scurvy is caused by lack of Vitamin C (ascorbic acid). Rickets is due to Vitamin D deficiency.", "easy", "exam_police", 2021);
q(GS, "Which cell organelle is known as the 'powerhouse of the cell'?", ["Ribosome", "Nucleus", "Mitochondria", "Golgi body"], "C", "Mitochondria produce ATP through cellular respiration and are called the powerhouse of the cell.", "easy", "exam_uksssc", 2022);
q(GS, "The hormone insulin is secreted by:", ["Liver", "Pancreas", "Thyroid", "Adrenal gland"], "B", "Insulin is produced by the beta cells of the islets of Langerhans in the pancreas.", "easy", "exam_patwari", 2023);
q(GS, "The chemical formula of common salt is:", ["NaCl", "KCl", "NaOH", "Na2CO3"], "A", "Common salt is sodium chloride, NaCl.", "easy", "exam_police", 2022);
q(GS, "Which planet is the largest in the Solar System?", ["Saturn", "Jupiter", "Neptune", "Uranus"], "B", "Jupiter is the largest planet, with a mass more than twice that of all other planets combined.", "easy", "exam_uksssc", 2021);
q(GS, "The ozone layer is found mainly in which layer of the atmosphere?", ["Troposphere", "Stratosphere", "Mesosphere", "Thermosphere"], "B", "The ozone layer lies in the lower stratosphere, roughly 15–35 km above the Earth's surface.", "easy", "exam_forest_guard", 2022);
q(GS, "Newton's first law of motion is also known as the law of:", ["Acceleration", "Inertia", "Action and reaction", "Gravitation"], "B", "The first law states that a body remains at rest or in uniform motion unless acted upon by an external force — the law of inertia.", "easy", "exam_police", 2021);
q(GS, "The approximate speed of light in vacuum is:", ["3 × 10^6 m/s", "3 × 10^8 m/s", "3 × 10^10 m/s", "3 × 10^5 m/s"], "B", "Light travels at about 3 × 10^8 metres per second (299,792 km/s) in vacuum.", "easy", "exam_uksssc", 2022);
q(GS, "Who appoints the Attorney General of India?", ["Chief Justice of India", "Prime Minister", "President", "Parliament"], "C", "Under Article 76, the President appoints the Attorney General, the highest law officer of the country.", "medium", "exam_ukpsc", 2021);
q(GS, "The Finance Commission is constituted under which Article of the Constitution?", ["Article 280", "Article 324", "Article 356", "Article 370"], "A", "Article 280 provides for a Finance Commission every five years to recommend Centre–state tax distribution.", "medium", "exam_ukpsc", 2020);
q(GS, "Who presides over the joint sitting of both Houses of Parliament?", ["President", "Vice-President", "Speaker of Lok Sabha", "Prime Minister"], "C", "Under Article 118(4), the Speaker of the Lok Sabha presides over a joint sitting.", "medium", "exam_uksssc", 2021);
q(GS, "The Simon Commission visited India in:", ["1919", "1927", "1928", "1935"], "C", "The Simon Commission, appointed in 1927 with no Indian member, arrived in India in February 1928 and was boycotted.", "medium", "exam_police", 2022);
q(GS, "Which gas is most abundant in the Earth's atmosphere?", ["Oxygen", "Carbon dioxide", "Nitrogen", "Argon"], "C", "Nitrogen makes up about 78% of the atmosphere; oxygen about 21%.", "easy", "exam_patwari", 2023);
q(GS, "The pH value of pure water at 25°C is:", ["0", "7", "14", "1"], "B", "Pure water is neutral with a pH of 7 at 25°C.", "easy", "exam_uksssc", 2022);

/* ------------------------------------------------------------------ */
/* Current Affairs (q_0101 – q_0125)                                   */
/* ------------------------------------------------------------------ */
q(CA, "Chandrayaan-3 made a soft landing near the lunar south pole on:", ["23 July 2023", "23 August 2023", "2 September 2023", "14 July 2023"], "B", "ISRO's Chandrayaan-3 Vikram lander touched down on 23 August 2023, now observed as National Space Day.", "easy", "exam_uksssc", 2024);
q(CA, "Aditya-L1, India's first solar observatory mission, was launched in:", ["July 2023", "September 2023", "January 2024", "March 2024"], "B", "Aditya-L1 was launched on 2 September 2023 and reached the Lagrange point L1 in January 2024.", "medium", "exam_police", 2024);
q(CA, "India hosted the G20 Leaders' Summit in New Delhi in which year?", ["2021", "2022", "2023", "2024"], "C", "India held the G20 presidency from December 2022 and hosted the summit in New Delhi on 9–10 September 2023.", "easy", "exam_uksssc", 2024);
q(CA, "Uttarakhand became the first Indian state after independence to pass a Uniform Civil Code bill in:", ["2022", "2023", "2024", "2025"], "C", "The Uttarakhand Uniform Civil Code Bill was passed by the assembly in February 2024 and the code was implemented from 27 January 2025.", "medium", "exam_ukpsc", 2024);
q(CA, "The Nari Shakti Vandan Adhiniyam (2023) provides for reservation of what share of seats for women in the Lok Sabha and state assemblies?", ["25%", "33%", "40%", "50%"], "B", "The 106th Constitutional Amendment reserves one-third of seats for women, to take effect after the next delimitation.", "medium", "exam_uksssc", 2024);
q(CA, "Under PM-KISAN, eligible farmer families receive an annual income support of:", ["₹4,000", "₹6,000", "₹8,000", "₹12,000"], "B", "PM-KISAN provides ₹6,000 per year in three equal instalments of ₹2,000 directly to bank accounts.", "easy", "exam_vdo", 2023);
q(CA, "Ayushman Bharat PM-JAY provides health cover of up to how much per family per year?", ["₹1 lakh", "₹2 lakh", "₹5 lakh", "₹10 lakh"], "C", "PM-JAY, launched in September 2018, provides ₹5 lakh per family per year for secondary and tertiary care hospitalisation.", "easy", "exam_police", 2022);
q(CA, "The Unified Payments Interface (UPI) was developed by:", ["Reserve Bank of India", "NPCI", "SEBI", "NITI Aayog"], "B", "UPI was launched in 2016 by the National Payments Corporation of India (NPCI).", "easy", "exam_uksssc", 2022);
q(CA, "The National Education Policy that replaced the 1986 policy was approved in:", ["2018", "2019", "2020", "2021"], "C", "NEP 2020 was approved by the Union Cabinet on 29 July 2020, introducing the 5+3+3+4 school structure.", "easy", "exam_teaching", 2023);
q(CA, "International Day of Yoga is observed on:", ["5 June", "21 June", "1 July", "15 August"], "B", "The UN declared 21 June as International Day of Yoga in 2014; the first was celebrated in 2015.", "easy", "exam_police", 2021);
q(CA, "The Swachh Bharat Mission was launched on:", ["15 August 2014", "2 October 2014", "26 January 2015", "1 July 2015"], "B", "Swachh Bharat Mission was launched on 2 October 2014, Gandhi Jayanti.", "easy", "exam_uksssc", 2021);
q(CA, "The Pradhan Mantri Ujjwala Yojana provides:", ["Free electricity connections", "LPG connections to women of poor households", "Housing loans", "Crop insurance"], "B", "PMUY, launched in May 2016, provides deposit-free LPG connections to women from BPL households.", "easy", "exam_vdo", 2023);
q(CA, "The headquarters of ISRO is located at:", ["Thiruvananthapuram", "Sriharikota", "Bengaluru", "Hyderabad"], "C", "ISRO is headquartered in Bengaluru; launches take place from Sriharikota (Satish Dhawan Space Centre).", "easy", "exam_police", 2022);
q(CA, "The Election Commission of India consists of the Chief Election Commissioner and how many other Election Commissioners?", ["One", "Two", "Three", "Four"], "B", "Since 1993 the Commission has been a three-member body: the CEC and two Election Commissioners.", "medium", "exam_uksssc", 2022);
q(CA, "The 'Beti Bachao Beti Padhao' scheme was launched in 2015 from:", ["Panipat, Haryana", "Jaipur, Rajasthan", "Lucknow, UP", "Dehradun"], "A", "The scheme was launched on 22 January 2015 at Panipat, Haryana, to address the declining child sex ratio.", "medium", "exam_police", 2021);
q(CA, "The Paris Agreement on climate change was adopted in:", ["2012", "2015", "2016", "2018"], "B", "The Paris Agreement was adopted at COP21 in December 2015 and entered into force in November 2016.", "easy", "exam_forest_guard", 2022);
q(CA, "'Digital India' programme was launched in:", ["2014", "2015", "2016", "2017"], "B", "Digital India was launched on 1 July 2015 to make government services available electronically.", "easy", "exam_uksssc", 2021);
q(CA, "The PM Jan Dhan Yojana for financial inclusion was launched in:", ["2013", "2014", "2015", "2016"], "B", "PMJDY was launched on 28 August 2014 to provide universal access to banking.", "easy", "exam_patwari", 2022);
q(CA, "The 'Lakhpati Didi' initiative aims to empower:", ["Farmers", "Women in self-help groups", "Street vendors", "Artisans"], "B", "Lakhpati Didi seeks to enable women in self-help groups to earn at least ₹1 lakh per year.", "medium", "exam_vdo", 2024);
q(CA, "Which Indian city hosted the 2023 G20 summit venue 'Bharat Mandapam'?", ["Mumbai", "New Delhi", "Bengaluru", "Hyderabad"], "B", "Bharat Mandapam at Pragati Maidan, New Delhi, was the venue of the G20 Leaders' Summit 2023.", "easy", "exam_uksssc", 2024);
q(CA, "The Comptroller and Auditor General of India is appointed by the President and holds office for:", ["5 years or till 60 years of age", "6 years or till 65 years of age", "4 years", "Till 62 years of age"], "B", "Under Article 148 the CAG serves for six years or until age 65, whichever is earlier.", "medium", "exam_ukpsc", 2022);
q(CA, "The 'Har Ghar Jal' goal is part of which mission?", ["Swachh Bharat Mission", "Jal Jeevan Mission", "AMRUT", "Namami Gange"], "B", "Jal Jeevan Mission, launched in 2019, aims to provide tap water connections to all rural households.", "easy", "exam_vdo", 2023);
q(CA, "Gaganyaan is India's programme for:", ["Mars orbiter", "Human spaceflight", "Reusable launch vehicle", "Lunar rover"], "B", "Gaganyaan aims to send Indian astronauts to low Earth orbit on an Indian launch vehicle.", "easy", "exam_police", 2023);
q(CA, "The 'Kedarnath Dham reconstruction' and 'Char Dham all-weather road' projects are located in:", ["Himachal Pradesh", "Uttarakhand", "Jammu & Kashmir", "Sikkim"], "B", "Both projects are in Uttarakhand; the Char Dham road project connects Yamunotri, Gangotri, Kedarnath and Badrinath.", "easy", "exam_uksssc", 2023);
q(CA, "The 'Vibrant Villages Programme' focuses on development of villages along:", ["Coastal areas", "The northern border", "Naxal-affected areas", "River islands"], "B", "The programme (2023) develops border villages in states including Uttarakhand, Himachal, Arunachal, Sikkim and Ladakh.", "medium", "exam_ukpsc", 2024);

/* ------------------------------------------------------------------ */
/* Hindi (q_0126 – q_0150)                                             */
/* ------------------------------------------------------------------ */
q(HI, "'विद्यालय' शब्द में कौन-सी संधि है?", ["गुण संधि", "दीर्घ संधि", "वृद्धि संधि", "यण संधि"], "B", "विद्या + आलय = विद्यालय। आ + आ = आ होने से यह दीर्घ स्वर संधि है।", "easy", "exam_uksssc", 2021);
q(HI, "'सूर्योदय' का सही संधि-विच्छेद है:", ["सूर्य + उदय", "सूर्यो + दय", "सूर + योदय", "सूर्य + ओदय"], "A", "सूर्य + उदय = सूर्योदय। अ + उ = ओ होने से यह गुण संधि है।", "easy", "exam_police", 2022);
q(HI, "'हिमालय' में कौन-सी संधि है?", ["यण संधि", "दीर्घ संधि", "अयादि संधि", "व्यंजन संधि"], "B", "हिम + आलय = हिमालय। अ + आ = आ, अतः दीर्घ संधि।", "easy", "exam_patwari", 2023);
q(HI, "'राजपुत्र' में कौन-सा समास है?", ["द्वंद्व", "तत्पुरुष", "बहुव्रीहि", "द्विगु"], "B", "राजपुत्र = राजा का पुत्र। यहाँ 'का' विभक्ति लुप्त है, अतः संबंध तत्पुरुष समास है।", "easy", "exam_uksssc", 2022);
q(HI, "'पंचवटी' में कौन-सा समास है?", ["द्विगु", "कर्मधारय", "बहुव्रीहि", "अव्ययीभाव"], "A", "पंचवटी = पाँच वटों का समाहार। पहला पद संख्यावाचक है, अतः द्विगु समास।", "medium", "exam_ukpsc", 2020);
q(HI, "'नीलकमल' में कौन-सा समास है?", ["तत्पुरुष", "कर्मधारय", "द्वंद्व", "बहुव्रीहि"], "B", "नीलकमल = नीला है जो कमल। विशेषण-विशेष्य संबंध होने से कर्मधारय समास।", "medium", "exam_uksssc", 2021);
q(HI, "'पीताम्बर' में कौन-सा समास है?", ["कर्मधारय", "तत्पुरुष", "बहुव्रीहि", "द्विगु"], "C", "पीताम्बर = पीला है अम्बर (वस्त्र) जिसका अर्थात् श्रीकृष्ण। अन्य पद प्रधान होने से बहुव्रीहि समास।", "hard", "exam_ukpsc", 2019);
q(HI, "'उत्थान' का विलोम शब्द है:", ["उन्नति", "पतन", "विकास", "प्रगति"], "B", "उत्थान का विलोम पतन है।", "easy", "exam_police", 2021);
q(HI, "'अमृत' का विलोम शब्द है:", ["सुधा", "विष", "पीयूष", "जल"], "B", "अमृत का विलोम विष है। सुधा और पीयूष अमृत के पर्यायवाची हैं।", "easy", "exam_vdo", 2023);
q(HI, "'कमल' का पर्यायवाची नहीं है:", ["पंकज", "जलज", "नीरज", "नीरद"], "D", "पंकज, जलज, नीरज, सरोज, अरविंद — कमल के पर्यायवाची हैं। नीरद का अर्थ बादल है।", "medium", "exam_uksssc", 2022);
q(HI, "'सूर्य' का पर्यायवाची शब्द है:", ["दिनकर", "निशाकर", "सुधाकर", "रजनीश"], "A", "दिनकर, भास्कर, रवि, आदित्य — सूर्य के पर्यायवाची हैं। निशाकर, सुधाकर, रजनीश चंद्रमा के पर्यायवाची हैं।", "easy", "exam_police", 2022);
q(HI, "'आँखों का तारा होना' मुहावरे का अर्थ है:", ["बहुत प्रिय होना", "आँख में दर्द होना", "देखने में सुंदर होना", "नज़र लगना"], "A", "'आँखों का तारा होना' का अर्थ है — अत्यंत प्रिय होना।", "easy", "exam_patwari", 2022);
q(HI, "'नौ दो ग्यारह होना' मुहावरे का अर्थ है:", ["गिनती करना", "भाग जाना", "झगड़ा करना", "धोखा देना"], "B", "'नौ दो ग्यारह होना' का अर्थ है — भाग जाना।", "easy", "exam_uksssc", 2021);
q(HI, "'दूध' शब्द किस तत्सम शब्द का तद्भव रूप है?", ["दुग्ध", "दधि", "क्षीर", "पय"], "A", "'दुग्ध' तत्सम शब्द है जिसका तद्भव रूप 'दूध' है।", "easy", "exam_police", 2021);
q(HI, "'अग्नि' का तद्भव रूप है:", ["आग", "अगन", "अनल", "पावक"], "A", "'अग्नि' (तत्सम) का तद्भव रूप 'आग' है। अनल और पावक अग्नि के पर्यायवाची हैं।", "easy", "exam_vdo", 2023);
q(HI, "'प्रगति' शब्द में उपसर्ग है:", ["प्र", "प्रग", "प्रति", "पर"], "A", "प्र + गति = प्रगति। यहाँ 'प्र' उपसर्ग है।", "easy", "exam_uksssc", 2022);
q(HI, "'लिखावट' शब्द में प्रत्यय है:", ["वट", "आवट", "ट", "अट"], "B", "लिख + आवट = लिखावट। 'आवट' कृदंत प्रत्यय है, जैसे सजावट, बनावट।", "medium", "exam_police", 2022);
q(HI, "'राम ने रावण को मारा' — वाक्य में 'को' किस कारक का चिह्न है?", ["कर्ता", "कर्म", "करण", "संप्रदान"], "B", "जिस पर क्रिया का फल पड़े वह कर्म कारक है; 'को' कर्म कारक का चिह्न है।", "medium", "exam_uksssc", 2021);
q(HI, "दोहा छंद के प्रथम और तृतीय चरण में कितनी मात्राएँ होती हैं?", ["11", "13", "16", "24"], "B", "दोहा अर्द्धसम मात्रिक छंद है — प्रथम और तृतीय चरण में 13, द्वितीय और चतुर्थ चरण में 11 मात्राएँ होती हैं।", "medium", "exam_ukpsc", 2020);
q(HI, "'पीपर पात सरिस मन डोला' — पंक्ति में कौन-सा अलंकार है?", ["रूपक", "उपमा", "उत्प्रेक्षा", "अनुप्रास"], "B", "यहाँ मन की तुलना पीपल के पत्ते से 'सरिस' (समान) वाचक शब्द द्वारा की गई है, अतः उपमा अलंकार है।", "medium", "exam_uksssc", 2022);
q(HI, "'कामायनी' महाकाव्य के रचयिता हैं:", ["सूर्यकांत त्रिपाठी 'निराला'", "जयशंकर प्रसाद", "सुमित्रानंदन पंत", "महादेवी वर्मा"], "B", "'कामायनी' (1936) छायावाद के प्रमुख कवि जयशंकर प्रसाद की रचना है।", "easy", "exam_teaching", 2022);
q(HI, "भारतीय संविधान के किस अनुच्छेद में हिंदी को संघ की राजभाषा घोषित किया गया है?", ["अनुच्छेद 343", "अनुच्छेद 348", "अनुच्छेद 351", "अनुच्छेद 350"], "A", "अनुच्छेद 343 के अनुसार देवनागरी लिपि में हिंदी संघ की राजभाषा है।", "medium", "exam_ukpsc", 2021);
q(HI, "'गंगा' शब्द किस प्रकार की संज्ञा है?", ["जातिवाचक", "व्यक्तिवाचक", "भाववाचक", "समूहवाचक"], "B", "किसी विशेष व्यक्ति, स्थान या वस्तु के नाम को व्यक्तिवाचक संज्ञा कहते हैं। 'गंगा' व्यक्तिवाचक संज्ञा है।", "easy", "exam_police", 2021);
q(HI, "'मैं' शब्द किस पुरुष का सर्वनाम है?", ["उत्तम पुरुष", "मध्यम पुरुष", "अन्य पुरुष", "निजवाचक"], "A", "बोलने वाला (वक्ता) उत्तम पुरुष होता है — मैं, हम।", "easy", "exam_patwari", 2023);
q(HI, "निम्न में से शुद्ध वर्तनी वाला शब्द है:", ["आशीर्वाद", "आशिर्वाद", "आर्शीवाद", "आर्शिवाद"], "A", "शुद्ध वर्तनी 'आशीर्वाद' है।", "easy", "exam_uksssc", 2022);

/* ------------------------------------------------------------------ */
/* English (q_0151 – q_0170)                                           */
/* ------------------------------------------------------------------ */
q(EN, "Choose the word closest in meaning to 'abundant':", ["Scarce", "Plentiful", "Rare", "Meagre"], "B", "'Abundant' means existing in large quantities — plentiful.", "easy", "exam_uksssc", 2021);
q(EN, "Choose the antonym of 'benevolent':", ["Kind", "Generous", "Malevolent", "Charitable"], "C", "'Benevolent' means well-meaning and kindly; its opposite is 'malevolent'.", "easy", "exam_police", 2022);
q(EN, "One who cannot read or write is called:", ["Illegible", "Illiterate", "Ignorant", "Innocent"], "B", "'Illiterate' is the one-word substitution for a person unable to read or write.", "easy", "exam_patwari", 2022);
q(EN, "Select the correctly spelt word:", ["Accomodate", "Acommodate", "Accommodate", "Acomodate"], "C", "The correct spelling is 'accommodate' — double c and double m.", "easy", "exam_uksssc", 2022);
q(EN, "Fill in the blank: She is ____ honest woman.", ["a", "an", "the", "no article"], "B", "'Honest' begins with a silent h and a vowel sound, so 'an' is used.", "easy", "exam_police", 2021);
q(EN, "Fill in the blank: He is good ____ mathematics.", ["in", "at", "on", "for"], "B", "The correct collocation is 'good at' a subject or skill.", "easy", "exam_vdo", 2023);
q(EN, "Change into passive voice: 'They built this bridge in 1990.'", ["This bridge is built in 1990.", "This bridge was built in 1990.", "This bridge had built in 1990.", "This bridge has been built in 1990."], "B", "Simple past active becomes 'was/were + past participle' in passive: 'This bridge was built in 1990.'", "medium", "exam_uksssc", 2021);
q(EN, "Fill in the blank: Neither of the boys ____ present.", ["were", "was", "are", "have been"], "B", "'Neither of' takes a singular verb: 'Neither of the boys was present.'", "medium", "exam_police", 2022);
q(EN, "The idiom 'a piece of cake' means:", ["Something delicious", "Something very easy", "A small portion", "A celebration"], "B", "'A piece of cake' means a task that is very easy to do.", "easy", "exam_patwari", 2023);
q(EN, "The plural of 'criterion' is:", ["Criterions", "Criteria", "Criterias", "Criterion"], "B", "'Criterion' is a Greek-origin noun whose plural is 'criteria'.", "medium", "exam_uksssc", 2022);
q(EN, "Fill in the blank: Everyone ____ finished the test.", ["have", "has", "were", "are"], "B", "'Everyone' is singular and takes 'has'.", "easy", "exam_police", 2021);
q(EN, "Change into indirect speech: He said, 'I am tired.'", ["He said that he is tired.", "He said that he was tired.", "He said that I was tired.", "He told that he is tired."], "B", "In reported speech the present tense shifts to past and the pronoun changes: 'He said that he was tired.'", "medium", "exam_uksssc", 2021);
q(EN, "The adjective form of 'nation' is:", ["Nationally", "National", "Nationalise", "Nationality"], "B", "'National' is the adjective; 'nationality' is a noun and 'nationally' an adverb.", "easy", "exam_vdo", 2023);
q(EN, "Fill in the blank: This is a secret between you and ____.", ["I", "me", "myself", "mine"], "B", "After a preposition the objective case is used: 'between you and me'.", "medium", "exam_police", 2022);
q(EN, "Choose the antonym of 'ancient':", ["Old", "Antique", "Modern", "Historic"], "C", "'Ancient' means very old; its opposite is 'modern'.", "easy", "exam_patwari", 2022);
q(EN, "The comparative degree of 'bad' is:", ["Badder", "Worse", "Worst", "More bad"], "B", "'Bad' has irregular forms: bad, worse, worst.", "easy", "exam_uksssc", 2022);
q(EN, "Fill in the blank: The Prime Minister, along with his ministers, ____ arrived.", ["have", "has", "were", "are"], "B", "When a subject is joined to another by 'along with', the verb agrees with the first subject (singular): 'has arrived'.", "hard", "exam_ukpsc", 2020);
q(EN, "Choose the correct sentence:", ["She has been living here since 2010.", "She is living here since 2010.", "She lives here since 2010.", "She was living here since 2010."], "A", "'Since + point of time' is used with the present perfect continuous tense.", "medium", "exam_uksssc", 2021);
q(EN, "The word 'elicit' means:", ["To avoid", "To draw out", "To hide", "To prohibit"], "B", "'Elicit' means to draw out a response or information. It is often confused with 'illicit' (illegal).", "medium", "exam_ukpsc", 2021);
q(EN, "One who speaks many languages is called a:", ["Linguist", "Polyglot", "Bilingual", "Orator"], "B", "A 'polyglot' is a person who knows and uses several languages.", "medium", "exam_police", 2022);

/* ------------------------------------------------------------------ */
/* Mathematics (q_0171 – q_0195)                                       */
/* ------------------------------------------------------------------ */
q(MA, "What is 25% of 480?", ["100", "110", "120", "130"], "C", "25% of 480 = 480 × 25/100 = 120.", "easy", "exam_police", 2022);
q(MA, "A number increased by 20% becomes 96. The original number is:", ["76", "80", "84", "90"], "B", "Let the number be x. 1.2x = 96 ⇒ x = 80.", "easy", "exam_uksssc", 2021);
q(MA, "Two numbers are in the ratio 3 : 5 and their sum is 64. The smaller number is:", ["20", "24", "30", "40"], "B", "3k + 5k = 64 ⇒ k = 8. The smaller number is 3 × 8 = 24.", "easy", "exam_patwari", 2023);
q(MA, "The simple interest on ₹5,000 at 8% per annum for 3 years is:", ["₹1,000", "₹1,200", "₹1,400", "₹1,500"], "B", "SI = P × R × T / 100 = 5000 × 8 × 3 / 100 = ₹1,200.", "easy", "exam_uksssc", 2022);
q(MA, "The average of the first 10 natural numbers is:", ["5", "5.5", "6", "6.5"], "B", "Sum of first 10 natural numbers = 55; average = 55/10 = 5.5.", "easy", "exam_police", 2021);
q(MA, "A can do a piece of work in 12 days and B in 18 days. Working together they will finish it in:", ["6 days", "7.2 days", "7.5 days", "8 days"], "B", "One-day work = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days.", "medium", "exam_uksssc", 2021);
q(MA, "A car travels at 60 km/h for 2.5 hours. The distance covered is:", ["120 km", "135 km", "150 km", "180 km"], "C", "Distance = speed × time = 60 × 2.5 = 150 km.", "easy", "exam_vdo", 2023);
q(MA, "The LCM of 12, 18 and 24 is:", ["48", "54", "72", "144"], "C", "12 = 2²·3, 18 = 2·3², 24 = 2³·3. LCM = 2³ × 3² = 72.", "easy", "exam_police", 2022);
q(MA, "The HCF of 36 and 48 is:", ["6", "8", "12", "24"], "C", "36 = 2²·3², 48 = 2⁴·3. HCF = 2² × 3 = 12.", "easy", "exam_patwari", 2022);
q(MA, "An article bought for ₹400 is sold for ₹460. The profit percentage is:", ["12%", "15%", "18%", "20%"], "B", "Profit = 60; profit % = 60/400 × 100 = 15%.", "easy", "exam_uksssc", 2022);
q(MA, "The square root of 1764 is:", ["38", "42", "44", "46"], "B", "42 × 42 = 1764.", "easy", "exam_police", 2021);
q(MA, "Find the next term: 2, 6, 12, 20, 30, ?", ["40", "42", "44", "48"], "B", "Terms are n(n+1): 1·2, 2·3, 3·4, 4·5, 5·6, so next = 6·7 = 42.", "medium", "exam_uksssc", 2021);
q(MA, "A 150 m long train running at 54 km/h will cross a pole in:", ["8 s", "10 s", "12 s", "15 s"], "B", "54 km/h = 15 m/s. Time = 150/15 = 10 seconds.", "medium", "exam_police", 2022);
q(MA, "The sum of the interior angles of a hexagon is:", ["540°", "630°", "720°", "900°"], "C", "Sum = (n − 2) × 180° = 4 × 180° = 720°.", "medium", "exam_patwari", 2023);
q(MA, "If 15% of a number is 45, the number is:", ["250", "300", "350", "400"], "B", "0.15x = 45 ⇒ x = 300.", "easy", "exam_vdo", 2023);
q(MA, "The area of a circle with radius 7 cm is (take π = 22/7):", ["144 cm²", "154 cm²", "164 cm²", "176 cm²"], "B", "Area = πr² = 22/7 × 49 = 154 cm².", "easy", "exam_uksssc", 2022);
q(MA, "If 3x + 7 = 22, then x equals:", ["3", "4", "5", "6"], "C", "3x = 15 ⇒ x = 5.", "easy", "exam_police", 2021);
q(MA, "The compound interest on ₹10,000 at 10% per annum for 2 years is:", ["₹2,000", "₹2,100", "₹2,200", "₹2,500"], "B", "Amount = 10000 × 1.1² = 12,100. CI = 12,100 − 10,000 = ₹2,100.", "medium", "exam_uksssc", 2021);
q(MA, "Two numbers are in the ratio 2 : 3 and their LCM is 48. Their HCF is:", ["6", "8", "12", "16"], "B", "Numbers are 2k and 3k; LCM = 6k = 48 ⇒ k = 8, which is also the HCF.", "medium", "exam_ukpsc", 2020);
q(MA, "A shopkeeper offers 20% discount on a marked price of ₹750. The selling price is:", ["₹550", "₹600", "₹625", "₹650"], "B", "SP = 750 × 0.8 = ₹600.", "easy", "exam_patwari", 2022);
q(MA, "The average of 5 numbers is 20. If one number is removed, the average becomes 18. The removed number is:", ["24", "26", "28", "30"], "C", "Total = 100; after removal total = 72. Removed number = 100 − 72 = 28.", "medium", "exam_police", 2022);
q(MA, "A pipe fills a tank in 6 hours and another empties it in 9 hours. With both open, the tank fills in:", ["12 h", "15 h", "18 h", "24 h"], "C", "Net rate = 1/6 − 1/9 = 1/18 per hour ⇒ 18 hours.", "hard", "exam_uksssc", 2022);
q(MA, "A man rows at 6 km/h in still water and the stream flows at 2 km/h. Time to row 12 km upstream is:", ["2 h", "2.5 h", "3 h", "4 h"], "C", "Upstream speed = 6 − 2 = 4 km/h. Time = 12/4 = 3 hours.", "medium", "exam_police", 2021);
q(MA, "0.2 × 0.3 equals:", ["0.6", "0.06", "0.006", "6"], "B", "0.2 × 0.3 = 0.06.", "easy", "exam_vdo", 2023);
q(MA, "A student scored 36 marks out of 80. The percentage is:", ["40%", "42%", "45%", "48%"], "C", "36/80 × 100 = 45%.", "easy", "exam_uksssc", 2022);

/* ------------------------------------------------------------------ */
/* Reasoning (q_0196 – q_0215)                                         */
/* ------------------------------------------------------------------ */
q(RE, "Find the next number: 3, 7, 15, 31, ?", ["47", "55", "63", "64"], "C", "Each term is (previous × 2) + 1: 31 × 2 + 1 = 63.", "easy", "exam_police", 2022);
q(RE, "If DELHI is coded as CDKGH, how is MUMBAI coded?", ["LTLAZH", "NVNCBJ", "LTLAHZ", "NVNCJB"], "A", "Each letter is replaced by the previous letter: M→L, U→T, M→L, B→A, A→Z, I→H = LTLAZH.", "medium", "exam_uksssc", 2021);
q(RE, "Doctor : Hospital :: Teacher : ?", ["Library", "School", "Office", "Court"], "B", "A doctor works in a hospital; a teacher works in a school.", "easy", "exam_patwari", 2023);
q(RE, "Find the odd one out:", ["Apple", "Mango", "Potato", "Banana"], "C", "Apple, mango and banana are fruits; potato is a vegetable (tuber).", "easy", "exam_police", 2021);
q(RE, "Pointing to a photograph, Raju said, 'He is the son of my father's only son.' How is the boy related to Raju?", ["Brother", "Nephew", "Son", "Cousin"], "C", "Raju's father's only son is Raju himself, so the boy is Raju's son.", "medium", "exam_uksssc", 2022);
q(RE, "A walks 5 km north, turns right and walks 3 km, turns right again and walks 5 km. How far and in which direction is A from the starting point?", ["3 km East", "3 km West", "5 km North", "8 km East"], "A", "The north and south legs cancel; A is 3 km east of the start.", "medium", "exam_police", 2022);
q(RE, "Ravi ranks 12th from the top and 20th from the bottom in a class. How many students are there?", ["30", "31", "32", "33"], "B", "Total = 12 + 20 − 1 = 31.", "easy", "exam_vdo", 2023);
q(RE, "If today is Monday, what day will it be after 61 days?", ["Friday", "Saturday", "Sunday", "Thursday"], "B", "61 ÷ 7 leaves remainder 5; Monday + 5 days = Saturday.", "medium", "exam_uksssc", 2021);
q(RE, "Find the next letter: A, C, F, J, O, ?", ["S", "T", "U", "V"], "C", "Differences increase by one: +2, +3, +4, +5, +6. O + 6 = U.", "medium", "exam_police", 2021);
q(RE, "A clock shows 3:00. What time does its mirror image show?", ["6:00", "9:00", "3:00", "12:00"], "B", "Mirror time = 12:00 − 3:00 = 9:00.", "easy", "exam_patwari", 2022);
q(RE, "Find the missing number: 4, 9, 16, 25, ?", ["30", "35", "36", "49"], "C", "The terms are squares: 2², 3², 4², 5², so next is 6² = 36.", "easy", "exam_uksssc", 2022);
q(RE, "If '+' means '×' and '×' means '+', then 5 + 3 × 2 = ?", ["11", "13", "17", "30"], "C", "Interchanging: 5 × 3 + 2 = 15 + 2 = 17.", "medium", "exam_police", 2022);
q(RE, "Complete the series: ACE, BDF, CEG, ?", ["DFH", "DGH", "EFH", "DFI"], "A", "Each letter of the group shifts by one: C→D, E→F, G→H gives DFH.", "easy", "exam_uksssc", 2021);
q(RE, "Statements: All roses are flowers. Some flowers are red. Conclusions: I. Some roses are red. II. All flowers are roses. Which follows?", ["Only I", "Only II", "Both I and II", "Neither I nor II"], "D", "The red flowers need not be roses, and 'all roses are flowers' does not imply all flowers are roses. Neither follows.", "hard", "exam_ukpsc", 2020);
q(RE, "A father is three times as old as his son. After 12 years he will be twice as old. The son's present age is:", ["10 years", "12 years", "14 years", "16 years"], "B", "3s + 12 = 2(s + 12) ⇒ s = 12.", "medium", "exam_police", 2021);
q(RE, "The angle between the hands of a clock at 3:30 is:", ["45°", "60°", "75°", "90°"], "C", "Hour hand at 3:30 = 105°, minute hand = 180°; difference = 75°.", "hard", "exam_uksssc", 2022);
q(RE, "In a standard die the opposite faces add up to 7. Which number is opposite to 3?", ["2", "4", "5", "6"], "B", "7 − 3 = 4.", "easy", "exam_vdo", 2023);
q(RE, "If ROAD is written as URDG, how is RAIN written?", ["UDLQ", "UDKQ", "TCKP", "UCLQ"], "A", "Each letter moves forward 3 places: R→U, A→D, I→L, N→Q.", "medium", "exam_police", 2022);
q(RE, "Find the next term: 1, 1, 2, 3, 5, 8, ?", ["11", "12", "13", "14"], "C", "Fibonacci sequence: each term is the sum of the previous two; 5 + 8 = 13.", "easy", "exam_patwari", 2023);
q(RE, "Which number does not belong: 27, 64, 125, 100?", ["27", "64", "125", "100"], "D", "27, 64 and 125 are perfect cubes (3³, 4³, 5³); 100 is not.", "easy", "exam_uksssc", 2021);

/* ------------------------------------------------------------------ */
/* Computer (q_0216 – q_0225)                                          */
/* ------------------------------------------------------------------ */
q(CO, "CPU stands for:", ["Central Processing Unit", "Central Program Unit", "Computer Processing Unit", "Control Processing Unit"], "A", "CPU is the Central Processing Unit, the part of the computer that executes instructions.", "easy", "exam_junior_assistant", 2023);
q(CO, "Which of the following is a volatile memory?", ["ROM", "Hard disk", "RAM", "DVD"], "C", "RAM loses its contents when power is switched off; ROM and storage devices are non-volatile.", "easy", "exam_junior_assistant", 2022);
q(CO, "One byte is equal to:", ["4 bits", "8 bits", "16 bits", "1024 bits"], "B", "A byte consists of 8 bits.", "easy", "exam_uksssc", 2022);
q(CO, "HTML is primarily used for:", ["Creating databases", "Designing web pages", "Operating systems", "Networking"], "B", "HyperText Markup Language structures content on web pages.", "easy", "exam_junior_assistant", 2023);
q(CO, "In MS Word, Ctrl + Z is used to:", ["Redo", "Undo", "Zoom", "Paste"], "B", "Ctrl + Z undoes the last action; Ctrl + Y redoes it.", "easy", "exam_junior_assistant", 2022);
q(CO, "Who is known as the 'father of the computer'?", ["Alan Turing", "Charles Babbage", "Bill Gates", "John von Neumann"], "B", "Charles Babbage designed the Analytical Engine in the 19th century and is called the father of the computer.", "easy", "exam_police", 2021);
q(CO, "Which of the following is an operating system?", ["MS Excel", "Google Chrome", "Windows 11", "Adobe Reader"], "C", "Windows 11 is an operating system; the others are application programs.", "easy", "exam_junior_assistant", 2023);
q(CO, "URL stands for:", ["Uniform Resource Locator", "Universal Reference Link", "Uniform Retrieval Link", "Unified Resource Language"], "A", "A URL (Uniform Resource Locator) is the address of a resource on the internet.", "easy", "exam_uksssc", 2021);
q(CO, "Which of the following is an input device?", ["Monitor", "Printer", "Keyboard", "Speaker"], "C", "A keyboard sends data into the computer; the others are output devices.", "easy", "exam_junior_assistant", 2022);
q(CO, "The binary equivalent of the decimal number 10 is:", ["1001", "1010", "1100", "1011"], "B", "10 = 8 + 2 = 1010 in binary.", "medium", "exam_junior_assistant", 2023);

/* ------------------------------------------------------------------ */
/* Pedagogy (q_0226 – q_0235)                                          */
/* ------------------------------------------------------------------ */
q(PE, "According to Piaget, the stage of cognitive development from about 7 to 11 years is called:", ["Sensorimotor", "Pre-operational", "Concrete operational", "Formal operational"], "C", "Piaget's concrete operational stage (7–11 years) is marked by logical thinking about concrete objects and conservation.", "easy", "exam_utet", 2023);
q(PE, "The concept of the 'Zone of Proximal Development' was given by:", ["Jean Piaget", "Lev Vygotsky", "B. F. Skinner", "Jerome Bruner"], "B", "Vygotsky defined the ZPD as the gap between what a child can do alone and with guidance.", "easy", "exam_utet", 2022);
q(PE, "The Right to Education Act, 2009 guarantees free and compulsory education to children in the age group:", ["3–6 years", "6–14 years", "5–15 years", "6–18 years"], "B", "Article 21A and the RTE Act 2009 provide free and compulsory education to children aged 6 to 14.", "easy", "exam_teaching", 2022);
q(PE, "The National Curriculum Framework that emphasised 'learning without burden' and constructivism was released in:", ["2000", "2005", "2009", "2020"], "B", "NCF 2005, prepared by NCERT, promoted child-centred, constructivist learning.", "medium", "exam_utet", 2023);
q(PE, "The theory of multiple intelligences was proposed by:", ["Howard Gardner", "Alfred Binet", "Charles Spearman", "Robert Sternberg"], "A", "Howard Gardner (1983) proposed eight or more distinct intelligences, such as linguistic, musical and spatial.", "easy", "exam_utet", 2022);
q(PE, "Operant conditioning is associated with:", ["Pavlov", "Skinner", "Thorndike", "Bandura"], "B", "B. F. Skinner developed operant conditioning, where behaviour is shaped by reinforcement and punishment.", "easy", "exam_teaching", 2023);
q(PE, "In the revised Bloom's taxonomy, the highest level of the cognitive domain is:", ["Evaluating", "Analysing", "Creating", "Applying"], "C", "The revised (2001) taxonomy orders levels as Remember, Understand, Apply, Analyse, Evaluate, Create.", "medium", "exam_utet", 2023);
q(PE, "The stages of moral development were proposed by:", ["Erik Erikson", "Lawrence Kohlberg", "Jean Piaget", "Carl Rogers"], "B", "Kohlberg described three levels (pre-conventional, conventional, post-conventional) with six stages of moral reasoning.", "easy", "exam_utet", 2022);
q(PE, "Inclusive education means:", ["Separate schools for children with disabilities", "Educating children with special needs alongside their peers in regular classrooms", "Home schooling for weak students", "Coaching only for gifted children"], "B", "Inclusive education ensures all children, regardless of ability, learn together in mainstream classrooms with appropriate support.", "easy", "exam_teaching", 2023);
q(PE, "A child who has persistent difficulty in reading and spelling despite normal intelligence may have:", ["Dyscalculia", "Dyslexia", "Dysgraphia", "Dyspraxia"], "B", "Dyslexia is a specific learning disability affecting reading; dyscalculia affects mathematics and dysgraphia affects writing.", "medium", "exam_utet", 2023);

/* ------------------------------------------------------------------ */
/* Environment & Forestry (q_0236 – q_0245)                            */
/* ------------------------------------------------------------------ */
q(EV, "The Forest (Conservation) Act was enacted in:", ["1972", "1980", "1986", "2006"], "B", "The Forest (Conservation) Act, 1980 restricts diversion of forest land for non-forest purposes without central approval.", "easy", "exam_forest_guard", 2022);
q(EV, "The Wildlife (Protection) Act was passed in:", ["1962", "1972", "1980", "1991"], "B", "The Wildlife (Protection) Act, 1972 provides for the protection of wild animals, birds and plants and lists them in schedules.", "easy", "exam_forest_guard", 2021);
q(EV, "Project Tiger was launched in 1973 from which tiger reserve?", ["Kanha", "Ranthambore", "Corbett", "Bandipur"], "C", "Project Tiger was launched on 1 April 1973 at Corbett National Park, Uttarakhand.", "easy", "exam_forest_guard", 2022);
q(EV, "The scientific name of Chir pine is:", ["Pinus wallichiana", "Pinus roxburghii", "Cedrus deodara", "Abies pindrow"], "B", "Chir pine (Pinus roxburghii) dominates Uttarakhand's forests between about 1,000 and 1,800 m.", "medium", "exam_forest_guard", 2023);
q(EV, "Deodar, a valuable Himalayan timber tree, has the scientific name:", ["Cedrus deodara", "Quercus leucotrichophora", "Shorea robusta", "Pinus roxburghii"], "A", "Deodar (Cedrus deodara) grows at 1,800–3,000 m. Shorea robusta is sal and Quercus leucotrichophora is banj oak.", "medium", "exam_forest_guard", 2022);
q(EV, "Uttarakhand's first Ramsar wetland site, designated in 2020, is:", ["Nainital lake", "Asan Conservation Reserve", "Bhimtal", "Tehri reservoir"], "B", "The Asan Conservation Reserve (Asan Barrage) in Dehradun district became a Ramsar site in 2020.", "medium", "exam_forest_guard", 2023);
q(EV, "The Nanda Devi Biosphere Reserve was established in:", ["1982", "1988", "1992", "2005"], "B", "Nanda Devi Biosphere Reserve was set up in 1988 and included in the UNESCO World Network of Biosphere Reserves in 2004.", "medium", "exam_forest_guard", 2022);
q(EV, "World Environment Day is celebrated on:", ["22 April", "5 June", "16 September", "21 March"], "B", "World Environment Day is observed on 5 June; 22 April is Earth Day and 21 March is International Day of Forests.", "easy", "exam_forest_guard", 2021);
q(EV, "The Van Gujjars are a pastoral community traditionally associated with which protected area of Uttarakhand?", ["Gangotri National Park", "Rajaji National Park", "Nanda Devi National Park", "Askot Sanctuary"], "B", "The Van Gujjars, semi-nomadic buffalo herders, traditionally migrate through the forests of Rajaji National Park.", "hard", "exam_forest_guard", 2023);
q(EV, "The International Day for the Preservation of the Ozone Layer is observed on:", ["5 June", "16 September", "2 February", "11 July"], "B", "16 September marks the signing of the Montreal Protocol in 1987.", "easy", "exam_forest_guard", 2022);

export const questions: Question[] = rows;

/** Helper for other seed files: ids of questions matching a filter, in stable order. */
export function questionIds(filter: (q: Question) => boolean): string[] {
  return rows.filter(filter).map((r) => r.id);
}
