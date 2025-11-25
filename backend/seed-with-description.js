require('dotenv').config();
const mongoose = require('mongoose');

// Schema ตรงกับ TypeScript model
const varietySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    soil_type: { type: String, required: true },
    pest: { type: [String], required: true },
    disease: { type: [String], required: true },
    yield: { type: String, required: true },
    age: { type: String, required: true },
    sweetness: { type: String, required: true },
    variety_image: { type: String, required: false, default: 'sugarcane-default.jpg' },
    parent_varieties: { type: String, required: false },
    growth_characteristics: { type: [String], required: false },
    planting_tips: { type: [String], required: false },
    suitable_for: { type: [String], required: false },
}, {
    collection: 'varieties',
    timestamps: true,
});

const Variety = mongoose.model('Variety', varietySchema);

const sugarcaneData = [
    {
        name: "พันธุ์อ้อย เค 88-92",
        description: "พันธุ์อ้อยที่มีความโดดเด่นด้านการเจริญเติบโตเร็วในระยะแรก เหมาะสำหรับดินร่วนเหนียว มีความทนทานต่อแมลงและโรคหลายชนิด ให้ผลผลิตดีในระดับ 15-16 ตันต่อไร่ ความหวาน 10-12 CCS",
        soil_type: "ดินร่วนเหนียว",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย"],
        disease: ["โรคใบขาว", "โรคแส้ดำ"],
        yield: "15-16",
        age: "11-12",
        sweetness: "10-12",
        variety_image: "sugarcane1.jpg",
        parent_varieties: "F143 (แม่) X ROC1 (พ่อ)",
        growth_characteristics: [
            "เจริญเติบโตเร็วในระยะแรก",
            "ทนแล้งปานกลาง",
            "แตกกอปานกลาง 5-6 ลำต่อกอ",
            "เส้นผ่านศูนย์กลางลำ 2.6-2.8 ซม."
        ]
    },
    {
        name: "พันธุ์อ้อย ขอนแก่น 3",
        description: "พันธุ์อ้อยที่ได้รับความนิยมในภาคตะวันออกเฉียงเหนือ เจริญเติบโตดีในดินร่วน มีความทนแล้งสูง ให้ความหวานดีเยี่ยม 11-13 CCS แตกกอดี เหมาะสำหรับพื้นที่ปลูกอ้อยทั่วไป",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น"],
        disease: ["โรคใบขาว", "เหี่ยวเน่าแดง"],
        yield: "14-15",
        age: "10-11",
        sweetness: "11-13",
        variety_image: "sugarcane2.jpg",
        parent_varieties: "CP70-321 X LCP85-384",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งดี",
            "แตกกอดี 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย อู่ทอง 2",
        description: "พันธุ์อ้อยสำหรับดินร่วนทราย มีความทนแล้งดี เหมาะกับพื้นที่ที่มีน้ำไม่สม่ำเสมอ ต้านทานแมลงศัตรูได้หลากหลาย ให้ผลผลิต 13-14 ตันต่อไร่",
        soil_type: "ดินร่วนทราย",
        pest: ["หนอนกออ้อย", "หวี่ขาว"],
        disease: ["โรคแส้ดำ"],
        yield: "13-14",
        age: "11-12",
        sweetness: "10-11",
        variety_image: "sugarcane3.jpg",
        parent_varieties: "F161 X Q117",
        growth_characteristics: [
            "เจริญเติบโตปานกลาง",
            "ทนแล้งดี",
            "แตกกอปานกลาง 5-6 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย LK 92-11",
        description: "พันธุ์อ้อยที่เจริญเติบโตเร็ว เหมาะสำหรับดินเหนียว ทนน้ำท่วมขัง ให้ผลผลิตสูง 16-17 ตันต่อไร่ ความหวานดี แตกกอดีมาก เหมาะกับพื้นที่ลุ่ม",
        soil_type: "ดินเหนียว",
        pest: ["หนอนเจาะลำต้น", "หวี่ขาว"],
        disease: ["โรคใบขาว", "โรคจุดใบเหลือง"],
        yield: "16-17",
        age: "12-13",
        sweetness: "11-12",
        variety_image: "sugarcane4.jpg",
        parent_varieties: "LK72-40 X F152",
        growth_characteristics: [
            "เจริญเติบโตเร็ว",
            "ทนน้ำท่วมขัง",
            "แตกกอดี 7-8 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ร้อยเอ็ด 71",
        description: "พันธุ์อ้อยสำหรับดินทราย ทนแล้งดีมาก เหมาะกับพื้นที่แห้งแล้ง แม้ผลผลิตปานกลาง 12-13 ตันต่อไร่ แต่เลี้ยงง่าย ต้นทุนต่ำ เหมาะกับเกษตรกรรายย่อย",
        soil_type: "ดินทราย",
        pest: ["หนอนกออ้อย"],
        disease: ["เหี่ยวเน่าแดง"],
        yield: "12-13",
        age: "10-11",
        sweetness: "9-10",
        variety_image: "sugarcane5.jpg",
        parent_varieties: "ROC10 X CP72-2086",
        growth_characteristics: [
            "เจริญเติบโตช้า",
            "ทนแล้งดีมาก",
            "แตกกอน้อย 4-5 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย เค 84-200",
        description: "พันธุ์อ้อยอเนกประสงค์ ทนทานต่อแมลงและโรคได้หลากหลาย เหมาะสำหรับดินร่วน ให้ผลผลิตดี 15-16 ตันต่อไร่ แตกกอดี เป็นที่นิยมในหลายพื้นที่",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย", "หวี่ขาว"],
        disease: ["โรคแส้ดำ", "โรคใบขาว"],
        yield: "15-16",
        age: "11-12",
        sweetness: "10-12",
        variety_image: "sugarcane6.jpg",
        parent_varieties: "F150 X ROC16",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอดี 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ศก 72-92",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีในดินร่วนเหนียว มีความทนทานต่อโรคจุดใบเหลืองและโรคกอตะใคร้ ให้ผลผลิต 14-15 ตันต่อไร่ ความหวานสูง 11-13 CCS",
        soil_type: "ดินร่วนเหนียว",
        pest: ["หนอนเจาะลำต้น"],
        disease: ["โรคจุดใบเหลือง", "โรคกอตะใคร้"],
        yield: "14-15",
        age: "11-12",
        sweetness: "11-13",
        variety_image: "sugarcane7.jpg",
        parent_varieties: "CP48-103 X F146",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอปานกลาง 5-6 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย อุบล 2",
        description: "พันธุ์อ้อยสำหรับดินร่วนทราย ทนแล้งดี ต้านทานโรคและแมลงได้หลายชนิด ให้ผลผลิต 13-14 ตันต่อไร่ เหมาะกับพื้นที่ภาคตะวันออกเฉียงเหนือ",
        soil_type: "ดินร่วนทราย",
        pest: ["หนอนกออ้อย", "หวี่ขาว"],
        disease: ["เหี่ยวเน่าแดง", "โรคแส้ดำ"],
        yield: "13-14",
        age: "10-11",
        sweetness: "10-11",
        variety_image: "sugarcane8.jpg",
        parent_varieties: "Q138 X F154",
        growth_characteristics: [
            "เจริญเติบโตปานกลาง",
            "ทนแล้งดี",
            "แตกกอปานกลาง 5-6 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ขอนแก่น 50",
        description: "พันธุ์อ้อยที่เจริญเติบโตเร็ว เหมาะสำหรับดินร่วน ทนแล้งดี ให้ผลผลิตสูง 15-16 ตันต่อไร่ ความหวานดี แตกกอดีมาก เป็นพันธุ์ยอดนิยม",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย"],
        disease: ["โรคใบขาว"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-12",
        variety_image: "sugarcane9.jpg",
        parent_varieties: "CP72-1210 X LCP85-384",
        growth_characteristics: [
            "เจริญเติบโตเร็ว",
            "ทนแล้งดี",
            "แตกกอดี 7-8 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย เค 95-84",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีมากในดินเหนียว ทนน้ำท่วมขัง ให้ผลผลิตสูงสุด 16-17 ตันต่อไร่ ความหวานสูง 11-13 CCS แตกกอดีมาก 8-9 ลำต่อกอ",
        soil_type: "ดินเหนียว",
        pest: ["หวี่ขาว"],
        disease: ["โรคจุดใบเหลือง", "โรคใบขาว"],
        yield: "16-17",
        age: "12-13",
        sweetness: "11-13",
        variety_image: "sugarcane10.jpg",
        parent_varieties: "F160 X Q165",
        growth_characteristics: [
            "เจริญเติบโตดีมาก",
            "ทนน้ำท่วมขัง",
            "แตกกอดีมาก 8-9 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย กำแพงเพชร 1",
        description: "พันธุ์อ้อยสำหรับดินทราย ทนแล้งดีมาก เหมาะกับพื้นที่แห้งแล้ง แม้ผลผลิตต่ำ 11-12 ตันต่อไร่ แต่ต้นทุนต่ำ เลี้ยงง่าย คุ้มค่าสำหรับพื้นที่จำกัด",
        soil_type: "ดินทราย",
        pest: ["หนอนกออ้อย"],
        disease: ["เหี่ยวเน่าแดง"],
        yield: "11-12",
        age: "10-11",
        sweetness: "9-10",
        variety_image: "sugarcane11.jpg",
        parent_varieties: "ROC1 X CP65-357",
        growth_characteristics: [
            "เจริญเติบโตช้า",
            "ทนแล้งดีมาก",
            "แตกกอน้อย 4-5 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย สุพรรณบุรี 1",
        description: "พันธุ์อ้อยเอนกประสงค์สำหรับดินร่วน ต้านทานแมลงและโรคได้ดี ให้ผลผลิต 14-15 ตันต่อไร่ ความหวานดี เหมาะกับพื้นที่ปลูกอ้อยภาคกลาง",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย"],
        disease: ["โรคแส้ดำ", "โรคใบขาว"],
        yield: "14-15",
        age: "11-12",
        sweetness: "10-12",
        variety_image: "sugarcane12.jpg",
        parent_varieties: "F134 X ROC5",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอดี 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย นครสวรรค์ 3",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีในดินร่วนเหนียว ต้านทานโรคกอตะใคร้และจุดใบเหลือง ให้ผลผลิต 15-16 ตันต่อไร่ ความหวานสูง เหมาะกับพื้นที่ภาคกลาง",
        soil_type: "ดินร่วนเหนียว",
        pest: ["หนอนเจาะลำต้น", "หวี่ขาว"],
        disease: ["โรคกอตะใคร้", "โรคจุดใบเหลือง"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-13",
        variety_image: "sugarcane13.jpg",
        parent_varieties: "F147 X Q180",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอปานกลาง 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ชัยนาท 2",
        description: "พันธุ์อ้อยสำหรับดินร่วนทราย ทนแล้งดี ต้านทานโรคและแมลง ให้ผลผลิต 13-14 ตันต่อไร่ เหมาะกับพื้นที่ที่มีน้ำไม่สม่ำเสมอ",
        soil_type: "ดินร่วนทราย",
        pest: ["หนอนกออ้อย"],
        disease: ["เหี่ยวเน่าแดง", "โรคแส้ดำ"],
        yield: "13-14",
        age: "10-11",
        sweetness: "10-11",
        variety_image: "sugarcane14.jpg",
        parent_varieties: "Q117 X F155",
        growth_characteristics: [
            "เจริญเติบโตปานกลาง",
            "ทนแล้งดี",
            "แตกกอปานกลาง 5-6 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย มหาสารคาม 1",
        description: "พันธุ์อ้อยที่เจริญเติบโตเร็ว เหมาะสำหรับดินร่วน ทนทานต่อแมลงและโรคหลากหลาย ให้ผลผลิต 15-16 ตันต่อไร่ แตกกอดี เป็นพันธุ์ยอดนิยมในภาคตะวันออกเฉียงเหนือ",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย", "หวี่ขาว"],
        disease: ["โรคใบขาว", "โรคแส้ดำ"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-12",
        variety_image: "sugarcane15.jpg",
        parent_varieties: "LCP85-384 X F162",
        growth_characteristics: [
            "เจริญเติบโตเร็ว",
            "ทนแล้งดี",
            "แตกกอดี 7-8 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ลพบุรี 1",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีมากในดินเหนียว ทนน้ำท่วมขัง ให้ผลผลิตสูงสุด 16-17 ตันต่อไร่ ความหวานสูงสุด 12-13 CCS แตกกอดีมาก 8-10 ลำต่อกอ",
        soil_type: "ดินเหนียว",
        pest: ["หวี่ขาว", "หนอนเจาะลำต้น"],
        disease: ["โรคจุดใบเหลือง", "โรคใบขาว"],
        yield: "16-17",
        age: "12-13",
        sweetness: "12-13",
        variety_image: "sugarcane16.jpg",
        parent_varieties: "F163 X Q200",
        growth_characteristics: [
            "เจริญเติบโตดีมาก",
            "ทนน้ำท่วมขัง",
            "แตกกอดีมาก 8-10 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย สิงห์บุรี 2",
        description: "พันธุ์อ้อยสำหรับดินร่วน เจริญเติบโตดี ต้านทานโรคแส้ดำ ให้ผลผลิต 14-15 ตันต่อไร่ ความหวานปานกลาง เหมาะกับพื้นที่ภาคกลาง",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น"],
        disease: ["โรคแส้ดำ"],
        yield: "14-15",
        age: "11-12",
        sweetness: "10-11",
        variety_image: "sugarcane17.jpg",
        parent_varieties: "F140 X ROC20",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอดี 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ราชบุรี 3",
        description: "พันธุ์อ้อยสำหรับดินทราย ทนแล้งดีมาก เหมาะกับพื้นที่แห้งแล้ง ให้ผลผลิต 12-13 ตันต่อไร่ ต้นทุนต่ำ เลี้ยงง่าย",
        soil_type: "ดินทราย",
        pest: ["หนอนกออ้อย"],
        disease: ["เหี่ยวเน่าแดง"],
        yield: "12-13",
        age: "10-11",
        sweetness: "9-10",
        variety_image: "sugarcane18.jpg",
        parent_varieties: "ROC10 X CP80-1743",
        growth_characteristics: [
            "เจริญเติบโตช้า",
            "ทนแล้งดีมาก",
            "แตกกอน้อย 4-5 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย พิษณุโลก 1",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีในดินร่วนเหนียว ต้านทานโรคใบขาวและกอตะใคร้ ให้ผลผลิต 15-16 ตันต่อไร่ ความหวานดี เหมาะกับพื้นที่ภาคเหนือตอนล่าง",
        soil_type: "ดินร่วนเหนียว",
        pest: ["หนอนเจาะลำต้น", "หวี่ขาว"],
        disease: ["โรคใบขาว", "โรคกอตะใคร้"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-12",
        variety_image: "sugarcane19.jpg",
        parent_varieties: "F156 X Q175",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอปานกลาง 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย เพชรบูรณ์ 2",
        description: "พันธุ์อ้อยสำหรับดินร่วนทราย ทนแล้งดี ต้านทานโรคและแมลงหลากหลาย ให้ผลผลิต 13-14 ตันต่อไร่ เหมาะกับพื้นที่ภาคเหนือตอนล่าง",
        soil_type: "ดินร่วนทราย",
        pest: ["หนอนกออ้อย", "หวี่ขาว"],
        disease: ["เหี่ยวเน่าแดง", "โรคแส้ดำ"],
        yield: "13-14",
        age: "10-11",
        sweetness: "10-11",
        variety_image: "sugarcane20.jpg",
        parent_varieties: "Q138 X F170",
        growth_characteristics: [
            "เจริญเติบโตปานกลาง",
            "ทนแล้งดี",
            "แตกกอปานกลาง 5-6 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย กาฬสินธุ์ 1",
        description: "พันธุ์อ้อยที่เจริญเติบโตเร็วในดินร่วน ทนแล้งดี ต้านทานโรคใบขาวและจุดใบเหลือง ให้ผลผลิต 15-16 ตันต่อไร่ ความหวานสูง เป็นพันธุ์ยอดนิยม",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย"],
        disease: ["โรคใบขาว", "โรคจุดใบเหลือง"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-13",
        variety_image: "sugarcane21.jpg",
        parent_varieties: "CP72-2086 X LCP85-384",
        growth_characteristics: [
            "เจริญเติบโตเร็ว",
            "ทนแล้งดี",
            "แตกกอดี 7-8 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย สกลนคร 2",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีมากในดินเหนียว ทนน้ำท่วมขัง ให้ผลผลิตสูง 16-17 ตันต่อไร่ ความหวานดี แตกกอดีมาก เหมาะกับพื้นที่ลุ่ม",
        soil_type: "ดินเหนียว",
        pest: ["หวี่ขาว"],
        disease: ["โรคจุดใบเหลือง", "โรคใบขาว"],
        yield: "16-17",
        age: "12-13",
        sweetness: "11-12",
        variety_image: "sugarcane22.jpg",
        parent_varieties: "F165 X Q185",
        growth_characteristics: [
            "เจริญเติบโตดีมาก",
            "ทนน้ำท่วมขัง",
            "แตกกอดีมาก 8-9 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย บุรีรัมย์ 3",
        description: "พันธุ์อ้อยสำหรับดินทราย ทนแล้งดีมาก เหมาะกับพื้นที่แห้งแล้ง ให้ผลผลิต 11-12 ตันต่อไร่ ต้นทุนต่ำ เลี้ยงง่าย คุ้มค่าสำหรับพื้นที่จำกัด",
        soil_type: "ดินทราย",
        pest: ["หนอนกออ้อย"],
        disease: ["เหี่ยวเน่าแดง"],
        yield: "11-12",
        age: "10-11",
        sweetness: "9-10",
        variety_image: "sugarcane23.jpg",
        parent_varieties: "ROC5 X CP70-321",
        growth_characteristics: [
            "เจริญเติบโตช้า",
            "ทนแล้งดีมาก",
            "แตกกอน้อย 4-5 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ศรีสะเกษ 1",
        description: "พันธุ์อ้อยเอนกประสงค์สำหรับดินร่วน ต้านทานแมลงและโรคได้ดี ให้ผลผลิต 14-15 ตันต่อไร่ ความหวานดี เหมาะกับพื้นที่ภาคตะวันออกเฉียงเหนือ",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น", "หวี่ขาว"],
        disease: ["โรคแส้ดำ", "โรคใบขาว"],
        yield: "14-15",
        age: "11-12",
        sweetness: "10-12",
        variety_image: "sugarcane24.jpg",
        parent_varieties: "F148 X ROC16",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอดี 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย สุรินทร์ 2",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีในดินร่วนเหนียว ต้านทานโรคกอตะใคร้และจุดใบเหลือง ให้ผลผลิต 15-16 ตันต่อไร่ ความหวานสูง เหมาะกับพื้นที่ภาคตะวันออกเฉียงเหนือ",
        soil_type: "ดินร่วนเหนียว",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย"],
        disease: ["โรคกอตะใคร้", "โรคจุดใบเหลือง"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-13",
        variety_image: "sugarcane25.jpg",
        parent_varieties: "F150 X Q190",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอปานกลาง 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ยโสธร 1",
        description: "พันธุ์อ้อยสำหรับดินร่วนทราย ทนแล้งดี ต้านทานโรคและแมลงหลากหลาย ให้ผลผลิต 13-14 ตันต่อไร่ เหมาะกับพื้นที่ที่มีน้ำไม่สม่ำเสมอ",
        soil_type: "ดินร่วนทราย",
        pest: ["หนอนกออ้อย", "หวี่ขาว"],
        disease: ["เหี่ยวเน่าแดง", "โรคแส้ดำ"],
        yield: "13-14",
        age: "10-11",
        sweetness: "10-11",
        variety_image: "sugarcane26.jpg",
        parent_varieties: "Q120 X F172",
        growth_characteristics: [
            "เจริญเติบโตปานกลาง",
            "ทนแล้งดี",
            "แตกกอปานกลาง 5-6 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย อำนาจเจริญ 2",
        description: "พันธุ์อ้อยที่เจริญเติบโตเร็วในดินร่วน ทนทานต่อแมลงและโรคหลากหลาย ให้ผลผลิต 15-16 ตันต่อไร่ ความหวานดี แตกกอดี เป็นพันธุ์ยอดนิยม",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย", "หวี่ขาว"],
        disease: ["โรคใบขาว", "โรคแส้ดำ"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-12",
        variety_image: "sugarcane27.jpg",
        parent_varieties: "LCP85-384 X F175",
        growth_characteristics: [
            "เจริญเติบโตเร็ว",
            "ทนแล้งดี",
            "แตกกอดี 7-8 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย มุกดาหาร 1",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีมากในดินเหนียว ทนน้ำท่วมขัง ให้ผลผลิตสูงสุด 16-17 ตันต่อไร่ ความหวานสูงสุด 12-13 CCS แตกกอดีมาก 8-10 ลำต่อกอ",
        soil_type: "ดินเหนียว",
        pest: ["หวี่ขาว", "หนอนเจาะลำต้น"],
        disease: ["โรคจุดใบเหลือง", "โรคใบขาว"],
        yield: "16-17",
        age: "12-13",
        sweetness: "12-13",
        variety_image: "sugarcane28.jpg",
        parent_varieties: "F168 X Q205",
        growth_characteristics: [
            "เจริญเติบโตดีมาก",
            "ทนน้ำท่วมขัง",
            "แตกกอดีมาก 8-10 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย นครปฐม 3",
        description: "พันธุ์อ้อยสำหรับดินร่วน เจริญเติบโตดี ต้านทานโรคแส้ดำ ให้ผลผลิต 14-15 ตันต่อไร่ ความหวานปานกลาง เหมาะกับพื้นที่ภาคกลาง",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น"],
        disease: ["โรคแส้ดำ"],
        yield: "14-15",
        age: "11-12",
        sweetness: "10-11",
        variety_image: "sugarcane29.jpg",
        parent_varieties: "F145 X ROC25",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอดี 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย สมุทรสาคร 1",
        description: "พันธุ์อ้อยสำหรับดินทราย ทนแล้งดีมาก เหมาะกับพื้นที่แห้งแล้ง ให้ผลผลิต 12-13 ตันต่อไร่ ต้นทุนต่ำ เลี้ยงง่าย",
        soil_type: "ดินทราย",
        pest: ["หนอนกออ้อย"],
        disease: ["เหี่ยวเน่าแดง"],
        yield: "12-13",
        age: "10-11",
        sweetness: "9-10",
        variety_image: "sugarcane30.jpg",
        parent_varieties: "ROC15 X CP85-1491",
        growth_characteristics: [
            "เจริญเติบโตช้า",
            "ทนแล้งดีมาก",
            "แตกกอน้อย 4-5 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ประจวบคีรีขันธ์ 2",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีในดินร่วนเหนียว ต้านทานโรคใบขาวและกอตะใคร้ ให้ผลผลิต 15-16 ตันต่อไร่ ความหวานดี เหมาะกับพื้นที่ภาคกลาง",
        soil_type: "ดินร่วนเหนียว",
        pest: ["หนอนเจาะลำต้น", "หวี่ขาว"],
        disease: ["โรคใบขาว", "โรคกอตะใคร้"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-12",
        variety_image: "sugarcane31.jpg",
        parent_varieties: "F158 X Q195",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอปานกลาง 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย เชียงใหม่ 1",
        description: "พันธุ์อ้อยสำหรับดินร่วนทราย ทนแล้งดี ต้านทานโรคและแมลงหลากหลาย ให้ผลผลิต 13-14 ตันต่อไร่ เหมาะกับพื้นที่ภาคเหนือ",
        soil_type: "ดินร่วนทราย",
        pest: ["หนอนกออ้อย", "หวี่ขาว"],
        disease: ["เหี่ยวเน่าแดง", "โรคแส้ดำ"],
        yield: "13-14",
        age: "10-11",
        sweetness: "10-11",
        variety_image: "sugarcane32.jpg",
        parent_varieties: "Q145 X F180",
        growth_characteristics: [
            "เจริญเติบโตปานกลาง",
            "ทนแล้งดี",
            "แตกกอปานกลาง 5-6 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย เชียงราย 2",
        description: "พันธุ์อ้อยที่เจริญเติบโตเร็วในดินร่วน ทนแล้งดี ต้านทานโรคใบขาวและจุดใบเหลือง ให้ผลผลิต 15-16 ตันต่อไร่ ความหวานสูง เหมาะกับพื้นที่ภาคเหนือ",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย"],
        disease: ["โรคใบขาว", "โรคจุดใบเหลือง"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-13",
        variety_image: "sugarcane33.jpg",
        parent_varieties: "CP75-1133 X LCP85-384",
        growth_characteristics: [
            "เจริญเติบโตเร็ว",
            "ทนแล้งดี",
            "แตกกอดี 7-8 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ลำปาง 3",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีมากในดินเหนียว ทนน้ำท่วมขัง ให้ผลผลิตสูง 16-17 ตันต่อไร่ ความหวานดี แตกกอดีมาก เหมาะกับพื้นที่ลุ่มภาคเหนือ",
        soil_type: "ดินเหนียว",
        pest: ["หวี่ขาว"],
        disease: ["โรคจุดใบเหลือง", "โรคใบขาว"],
        yield: "16-17",
        age: "12-13",
        sweetness: "11-12",
        variety_image: "sugarcane34.jpg",
        parent_varieties: "F170 X Q210",
        growth_characteristics: [
            "เจริญเติบโตดีมาก",
            "ทนน้ำท่วมขัง",
            "แตกกอดีมาก 8-9 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย แพร่ 1",
        description: "พันธุ์อ้อยสำหรับดินทราย ทนแล้งดีมาก เหมาะกับพื้นที่แห้งแล้ง ให้ผลผลิต 11-12 ตันต่อไร่ ต้นทุนต่ำ เลี้ยงง่าย คุ้มค่าสำหรับพื้นที่จำกัด",
        soil_type: "ดินทราย",
        pest: ["หนอนกออ้อย"],
        disease: ["เหี่ยวเน่าแดง"],
        yield: "11-12",
        age: "10-11",
        sweetness: "9-10",
        variety_image: "sugarcane35.jpg",
        parent_varieties: "ROC20 X CP78-1628",
        growth_characteristics: [
            "เจริญเติบโตช้า",
            "ทนแล้งดีมาก",
            "แตกกอน้อย 4-5 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย น่าน 2",
        description: "พันธุ์อ้อยเอนกประสงค์สำหรับดินร่วน ต้านทานแมลงและโรคได้ดี ให้ผลผลิต 14-15 ตันต่อไร่ ความหวานดี เหมาะกับพื้นที่ภาคเหนือ",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น", "หวี่ขาว"],
        disease: ["โรคแส้ดำ", "โรคใบขาว"],
        yield: "14-15",
        age: "11-12",
        sweetness: "10-12",
        variety_image: "sugarcane36.jpg",
        parent_varieties: "F152 X ROC30",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอดี 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย พะเยา 1",
        description: "พันธุ์อ้อยที่เจริญเติบโตดีในดินร่วนเหนียว ต้านทานโรคกอตะใคร้และจุดใบเหลือง ให้ผลผลิต 15-16 ตันต่อไร่ ความหวานสูง เหมาะกับพื้นที่ภาคเหนือ",
        soil_type: "ดินร่วนเหนียว",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย"],
        disease: ["โรคกอตะใคร้", "โรคจุดใบเหลือง"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-13",
        variety_image: "sugarcane37.jpg",
        parent_varieties: "F155 X Q215",
        growth_characteristics: [
            "เจริญเติบโตดี",
            "ทนแล้งปานกลาง",
            "แตกกอปานกลาง 6-7 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย แม่ฮ่องสอน 3",
        description: "พันธุ์อ้อยสำหรับดินร่วนทราย ทนแล้งดี ต้านทานโรคและแมลงหลากหลาย ให้ผลผลิต 13-14 ตันต่อไร่ เหมาะกับพื้นที่ภาคเหนือ",
        soil_type: "ดินร่วนทราย",
        pest: ["หนอนกออ้อย", "หวี่ขาว"],
        disease: ["เหี่ยวเน่าแดง", "โรคแส้ดำ"],
        yield: "13-14",
        age: "10-11",
        sweetness: "10-11",
        variety_image: "sugarcane38.jpg",
        parent_varieties: "Q155 X F185",
        growth_characteristics: [
            "เจริญเติบโตปานกลาง",
            "ทนแล้งดี",
            "แตกกอปานกลาง 5-6 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย ตาก 2",
        description: "พันธุ์อ้อยที่เจริญเติบโตเร็วในดินร่วน ทนทานต่อแมลงและโรคหลากหลาย ให้ผลผลิต 15-16 ตันต่อไร่ ความหวานดี แตกกอดี เป็นพันธุ์ยอดนิยมในภาคเหนือตอนล่าง",
        soil_type: "ดินร่วน",
        pest: ["หนอนเจาะลำต้น", "หนอนกออ้อย", "หวี่ขาว"],
        disease: ["โรคใบขาว", "โรคแส้ดำ"],
        yield: "15-16",
        age: "11-12",
        sweetness: "11-12",
        variety_image: "sugarcane39.jpg",
        parent_varieties: "LCP85-384 X F188",
        growth_characteristics: [
            "เจริญเติบโตเร็ว",
            "ทนแล้งดี",
            "แตกกอดี 7-8 ลำต่อกอ"
        ]
    },
    {
        name: "พันธุ์อ้อย สุโขทัย 1",
        description: "พันธุ์อ้อยพรีเมียมที่เจริญเติบโตดีมากในดินเหนียว ทนน้ำท่วมขัง ให้ผลผลิตสูงสุด 16-18 ตันต่อไร่ ความหวานสูงสุด 12-14 CCS แตกกอดีมาก 9-10 ลำต่อกอ เส้นผ่านศูนย์กลางลำใหญ่ 3.0-3.2 ซม.",
        soil_type: "ดินเหนียว",
        pest: ["หวี่ขาว", "หนอนเจาะลำต้น"],
        disease: ["โรคจุดใบเหลือง", "โรคใบขาว", "โรคกอตะใคร้"],
        yield: "16-18",
        age: "12-13",
        sweetness: "12-14",
        variety_image: "sugarcane40.jpg",
        parent_varieties: "F172 X Q220",
        growth_characteristics: [
            "เจริญเติบโตดีมาก",
            "ทนน้ำท่วมขัง",
            "แตกกอดีมาก 9-10 ลำต่อกอ",
            "เส้นผ่านศูนย์กลางลำ 3.0-3.2 ซม."
        ]
    }
];

async function seedDatabase() {
    try {
        // เชื่อมต่อ MongoDB
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('✓ Connected to MongoDB Atlas');

        // ลบข้อมูลเดิมทั้งหมด
        await Variety.deleteMany({});
        console.log('✓ Cleared existing data');

        // เพิ่มข้อมูลใหม่
        await Variety.insertMany(sugarcaneData);
        console.log(`✓ Successfully seeded ${sugarcaneData.length} sugarcane varieties`);

        // แสดงสรุปข้อมูล
        const soilTypes = await Variety.distinct('soil_type');
        console.log('\nSoil types:', soilTypes);
        
        const totalVarieties = await Variety.countDocuments();
        console.log(`Total varieties: ${totalVarieties}`);

        mongoose.connection.close();
        console.log('\n✓ Database connection closed');
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
