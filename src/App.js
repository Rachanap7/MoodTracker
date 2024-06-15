import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "react-calendar/dist/Calendar.css";

function App() {
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [storedMood, setStoredMood] = useState(
    JSON.parse(localStorage.getItem("MoodsList")) || []
  );

  const moodMap = {
    Happy: { value: 3, emoji: "😃" },
    Neutral: { value: 2, emoji: "😐" },
    Sad: { value: 1, emoji: "😢" },
    Angry: { value: 0, emoji: "😠" }
  };

  useEffect(() => {
    localStorage.setItem("MoodsList", JSON.stringify(storedMood));
  }, [storedMood]);

  const handleMood = (e) => {
    setMood(e.target.value);
  };
  const handleNote = (e) => {
    setNote(e.target.value);
  };
  const handleSubmit = () => {
    if (!mood) {
      alert("Please select your mood first!");
      return false;
    } else if (!note) {
      alert("Please enter your short note!");
      return false;
    } else {
      const moodEntry = storedMood.find(
        (entry) => entry.todayDate === selectedDate
      );
      let temp = {
        ...moodEntry,
        todayMood: mood,
        todayNote: note,
        todayDate: selectedDate,
      };
      if (moodEntry) {
        setStoredMood(
          storedMood.map((mood) => {
            if (mood.todayDate === selectedDate) {
              return temp;
            }else{
              return mood;
            }
          })
        );
        alert("Mood Updated successfully...");
      } else {
        setStoredMood([
          ...storedMood,
          {
            todayDate: selectedDate,
            todayMood: mood,
            todayNote: note,
          },
        ]);
        alert("Mood saved successfully...");
      }
      setMood("");
      setNote("");
      setSelectedDate(null);
    }
  };
  const tileContent = ({ date, view }) => {
    const dateString = date.toISOString().split("T")[0];
    const moodEntry = storedMood.find(
      (entry) => entry.todayDate === dateString
    );
    if (view === "month" && moodEntry) {
      return (
        <div className={`mood ${moodEntry.todayMood.toLowerCase()}`}>
         {moodMap[moodEntry.todayMood].emoji}
        </div>
      );
    }
    return null;
  };
  const handleDateClick = (date) => {
    setSelectedDate(date.toISOString().split("T")[0]);
  };
  useEffect(() => {
    setMood("");
    setNote("");
    const moodEntry = storedMood.find(
      (entry) => entry.todayDate === selectedDate
    );
    if (moodEntry) {
      setMood(moodEntry.todayMood);
      setNote(moodEntry.todayNote);
    }
  }, [selectedDate, storedMood]);

  const getCommonMood =()=>{
    if(storedMood.length===0) return "No moods are recorded!";
    const count= storedMood.reduce((acc,entry)=>{
      acc[entry.todayMood]=(acc[entry.todayMood]||0)+1;
      return acc;
    },{});
    return Object.keys(count).reduce((a, b) => (count[a] > count[b] ? a : b));
  }
  const getAverageMood = () => {
    if (storedMood.length === 0) return "No moods recorded";
    // const moodMap = { Happy: 3, Neutral: 2, Sad: 1, Angry: 0 };
    const totalMoodValue = storedMood.reduce((acc, entry) => acc + moodMap[entry.todayMood].value, 0);
    const averageValue = totalMoodValue / storedMood.length;
    const averageMood = Object.keys(moodMap).reduce((a, b) => Math.abs(moodMap[a].value - averageValue) < Math.abs(moodMap[b].value - averageValue) ? a : b);
    return moodMap[averageMood].emoji;
  };
  const getMoodStreaks = () => {
    if (storedMood.length===0) return "No moods recorded";

    const sortedMood = [...storedMood].sort((a,b)=>new Date(a.todayDate)-new Date(b.todayDate));
    let currentMood = sortedMood[0].todayMood;
    let currentStreak =1;
    let maxStreak={};

    for(let i=1;i<sortedMood.length;i++){
      const prevDate = new Date(sortedMood[i-1].todayDate);
      const currentDate = new Date(sortedMood[i].todayDate);
      const diffTime = Math.abs(currentDate-prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if(diffDays===1 && sortedMood[i].todayMood===currentMood){
        currentStreak++
      }else{
        if(!maxStreak[currentMood]||maxStreak[currentMood]<currentStreak){  
          maxStreak[currentMood]=currentStreak;
        }
        currentStreak=1;
        currentMood=sortedMood[i].todayMood;
      }
    }
    if (!maxStreak[currentMood] || maxStreak[currentMood] < currentStreak) {
      maxStreak[currentMood] = currentStreak;
    }
  console.log(maxStreak)
    return maxStreak;
    // let maxStreak = 0;
    // let currentStreak = 0;
    // storedMood.forEach((entry) => {
    //   if (entry.todayMood === targetMood) {
    //     currentStreak += 1;
    //     if (currentStreak > maxStreak) maxStreak = currentStreak;
    //   } else {
    //     currentStreak = 0;
    //   }
    // });
    // return maxStreak;


  };
  return (
    <div className="container">
      <div className="title text-center">Your Mood Tracker</div>
      <div className="flex-box">
        <div className="calendar">
          <div className="title text-center">Select the date..</div>
          <Calendar
            onChange={setDate}
            value={date}
            tileContent={tileContent}
            onClickDay={handleDateClick}
          />
        </div>
        
        <div className="statistics text-center mt-5">
        <h3>Mood Statistics</h3>
        <p><strong>Most Common Mood:</strong> {getCommonMood()}</p>
        <p><strong>Average Mood:</strong> {getAverageMood()}</p>
        <p><strong>Longest Streak:</strong> 
        <ul>
            {Object.entries(getMoodStreaks()).map(([mood, streak]) => (
              <li key={mood}>{moodMap[mood].emoji}: {streak} days</li>
            ))}
          </ul>
        </p>
      </div>
      </div>
      {selectedDate && (
          <div className="user-input mood-entry">
            <div className="title text-center">What's Your Mood...?</div>
            <select
              className="user-mood"
              onChange={(e) => handleMood(e)}
              value={mood}
            >
              <option value="">Select</option>
              <option value="Happy">Happy</option>
              <option value="Sad">Sad</option>
              <option value="Angry">Angry</option>
              <option value="Neutral">Neutral</option>
            </select>
            <input
              className="user-mood"
              placeholder="Add your note"
              onChange={(e) => handleNote(e)}
              value={note}
            ></input>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        )}
    </div>
  );
}

export default App;
