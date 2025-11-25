// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import sugarcaneUrl from './assets/sugar-cane-svgrepo-com.svg';
// import { GiSugarCane } from 'react-icons/gi';
// import { GiGroundSprout, GiHoneycomb, GiBee } from 'react-icons/gi';
// import { FaHourglassHalf } from 'react-icons/fa';
// import { MdHealthAndSafety } from 'react-icons/md';


// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//     <div className="home">
//
//     <section className='center'>
//         <form action="" method="post" className='save'>
//             <h3>find your perfect sugarcane</h3>
//             <div className="box">
//               <p>ระบุลักษณะดิน <span>*</span></p>
//               <select name="type" id="" className="input" required>
//                     <option value="flat">ดินร่วนเหนียว</option>
//                     <option value="flat">ดินร่วนทราย</option>
//                     <option value="flat">ดินร่วน</option>
//                 </select>
//             </div>
//             <div className="flex">
//             <div className="box">
//               <p>ต้านโรค <span>*</span></p>
//                 <select name="type" id="" className="input" required>
//                     <option value="flat">เหี่ยวเน่าเเดง</option>
//                     <option value="flat">โรคเเส้ดำ</option>
//                     <option value="flat">โรคกอตะใคร้</option>
//                     <option value="flat">ใบจุดเหลือง</option>
//                 </select>
//             </div>

//             <div className="box">
//               <p>ต้านเเมลง <span>*</span></p>
//                 <select name="type" id="" className="input" required>
//                     <option value="flat">หนอนเจาะลำต้น</option>
//                     <option value="flat">หวี่ขาว</option>
//                     <option value="flat">หนอนกออ้อย</option>
//                 </select>
//             </div>
//             </div>
//             <input type="submit" value="submit" className ="btn"/>
//             <img src={sugarcaneUrl} alt="Sugarcane Icon" style={{ width: '50px', height: '50px' }} />
//         </form>
//       </section>
//     </div>


//     <section className="listings">
//       <h1 className='heading'>latest listings</h1>

//       <div className="box-container">

//         <div className="box">
//           <div className="thumb">
            
//             <p className="type"><span>15-16 ตันต่อไร่</span></p>
//             <form action="" method='post' className='save'>
              
//             </form>
//               <img src="../public/sugarcane-bg.jpg" alt="" />
//               </div>
//             <h3 className="name">พันธ์สอน .6 (เค 88-92)</h3>
//             <p className="location"><i><FaHourglassHalf size={17} color="#DA2C32" /></i><span>11-12 เดือน</span></p>
//             <div className="flex">
//             <p><i> สภาพดินที่เหมาะสม :</i><span>ดินเหนียว</span></p>
//               <p><i>ความหวาน :</i><span>10-12 c.c.s</span></p>
//               <p><i>ต้านโรค :</i><span>โรคใบขาว</span></p>
//               <p><i>ต้านเเมลง : </i><span>หนอนเจาะลำต้น</span></p>
//             </div>
          
//         </div>

//       </div>
//     </section>
      
//     </>
//   )
// }

// export default App
import React, { useState } from 'react';
import { FaHourglassHalf } from 'react-icons/fa';

// Mock data สำหรับทดสอบ UI
const mockData = [
    {
        id: 1,
        name: 'พันธุ์อ้อย เค 88-92',
        soil_type: 'ดินร่วนเหนียว',
        pest: 'หนอนเจาะลำต้น',
        disease: 'โรคใบขาว',
        yield: '15-16',
        age: '11-12',
        sweetness: '10-12',
        variety_image: 'sugarcane1.jpg'
    },
    {
        id: 2,
        name: 'พันธุ์อ้อย LK 92-11',
        soil_type: 'ดินร่วน',
        pest: 'หนอนกออ้อย',
        disease: 'เหี่ยวเน่าแดง',
        yield: '18-20',
        age: '12-14',
        sweetness: '11-13',
        variety_image: 'sugarcane2.jpg'
    },
    {
        id: 3,
        name: 'พันธุ์อ้อย ขอนแก่น 3',
        soil_type: 'ดินร่วนทราย',
        pest: 'หวี่ขาว',
        disease: 'โรคแส้ดำ',
        yield: '14-15',
        age: '10-11',
        sweetness: '9-11',
        variety_image: 'sugarcane3.jpg'
    },
    {
        id: 4,
        name: 'พันธุ์อ้อย อุตรดิตถ์ 1',
        soil_type: 'ดินร่วนเหนียว',
        pest: 'หนอนเจาะลำต้น',
        disease: 'โรคกอตะใคร้',
        yield: '16-18',
        age: '11-13',
        sweetness: '10-12',
        variety_image: 'sugarcane4.jpg'
    },
    {
        id: 5,
        name: 'พันธุ์อ้อย เชียงราย 60',
        soil_type: 'ดินร่วน',
        pest: 'หวี่ขาว',
        disease: 'โรคจุดใบเหลือง',
        yield: '17-19',
        age: '12-13',
        sweetness: '11-14',
        variety_image: 'sugarcane5.jpg'
    }
];

function App() {
    const [soil, setSoil] = useState('');
    const [pest, setPest] = useState('');
    const [disease, setDisease] = useState('');
    const [results, setResults] = useState(mockData); // เริ่มต้นด้วย mock data

    const handleSearch = () => {
        // Filter mock data based on selections
        let filtered = mockData;

        if (soil) {
            filtered = filtered.filter(item => item.soil_type === soil);
        }
        if (pest) {
            filtered = filtered.filter(item => item.pest === pest);
        }
        if (disease) {
            filtered = filtered.filter(item => item.disease === disease);
        }

        setResults(filtered);
    };

    return (

        <>
        <div className="home">
          <section className="center">
            <div className="save">
            <h3>ค้นหาพันธุ์อ้อยที่เหมาะสม</h3>
            <div className="box">
            <p>ระบุลักษณะดิน <span>*</span></p>
                <select value={soil} onChange={(e) => setSoil(e.target.value)} className="input">
                    <option value="">-- เลือกดิน --</option>
                    <option value="ดินร่วน">ดินร่วน</option>
                    <option value="ดินร่วนทราย">ดินร่วนทราย</option>
                    <option value="ดินร่วนเหนียว">ดินร่วนเหนียว</option>
                </select>
            </div>

              <div className="flex">
              <div  className="box">
              <p>ต้านเเมลง <span>*</span></p>
                <select value={pest} onChange={(e) => setPest(e.target.value)} className="input">
                    <option value="">-- เลือกแมลง --</option>
                    <option value="หนอนเจาะลำต้น">หนอนเจาะลำต้น</option>
                    <option value="หนอนกออ้อย">หนอนกออ้อย</option>
                    <option value="หวี่ขาว">หวี่ขาว</option>
                </select>
            </div>
            <div  className="box">
            <p>ต้านโรค <span>*</span></p>
                <select value={disease} onChange={(e) => setDisease(e.target.value)} className="input">
                    <option value="">-- เลือกโรค --</option>
                    <option value="เหี่ยวเน่าแดง">เหี่ยวเน่าแดง</option>
                    <option value="โรคแส้ดำ">โรคแส้ดำ</option>
                    <option value="โรคจุดใบเหลือง">โรคจุดใบเหลือง</option>
                    <option value="โรคกอตะใคร้">โรคกอตะใคร้</option>
                </select>
            </div>
              </div>
            
            <button onClick={handleSearch} className ="btn">ค้นหา</button>
            </div>
          
          </section>
       
        </div>
            
          

            <h2 className='heading'> พันธุ์อ้อยที่เหมาะสม</h2>
            <section className="listings">
            {results.length > 0 ? (
                <div className="box-container">
                    {results.map((item) => (
                        <div
                            key={item.id}
                            className="box"
                            
                        >

                            <div className="thumb">
            
            <p className="type"><span>{item.yield} ตันต่อไร่</span></p>
            <form action="" method='post' className='save'>
              
            </form>
              
              <img 
  src={`/sugarcane-bg.jpg`}
  alt={item.name} 
  width="150" 
  onError={(e) => { e.target.src = '/sugarcane-bg.jpg'; }}
/>
              </div>
              <h3 className="name">{item.name}</h3>
              <p className="location"><i><FaHourglassHalf size={17} color="#DA2C32" /></i><span>{item.age} เดือน</span></p>
              <div className="flex">
             <p><i> สภาพดินที่เหมาะสม :</i><span>{item.soil_type}</span></p>
               <p><i>ความหวาน :</i><span>{item.sweetness} c.c.s</span></p>
               <p><i>ต้านโรค :</i><span>{item.disease}</span></p>
               <p><i>ต้านเเมลง : </i><span>{item.pest}</span></p>
             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className='no_info'>ไม่มีข้อมูลที่ตรงกับเงื่อนไข</p>
            )}
            </section>
            
        </>
    );
}

export default App;
