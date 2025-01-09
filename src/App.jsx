import React, { useState, useEffect } from "react";
import localforage from "localforage";
import translations from "./translations.json";

function App() {
  const [isFrenchToEnglish, setIsFrenchToEnglish] = useState(true);
  const [currentWord, setCurrentWord] = useState(null);
  const [userTranslation, setUserTranslation] = useState("");
  const [errorCounts, setErrorCounts] = useState({});
  const [message, setMessage] = useState("");
  const [inputBorderColor, setInputBorderColor] = useState("border-gray-300");
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [waitingForCheck, setWaitingForCheck] = useState(false);

  useEffect(() => {
    loadErrorCounts();
    pickRandomWord();
  }, [isFrenchToEnglish]);

  const loadErrorCounts = async () => {
    const storedCounts = (await localforage.getItem("errorCounts")) || {};
    setErrorCounts(storedCounts);
  };

  const saveErrorCounts = async (updatedCounts) => {
    await localforage.setItem("errorCounts", updatedCounts);
  };

  const normalizeString = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const pickRandomWord = () => {
    if (!translations || translations.length === 0) {
      setCurrentWord(null);
      return;
    }

    const weightedWords = translations.map((item) => {
      const key = isFrenchToEnglish ? item.fr : item.en;
      const errorCount = errorCounts[key] || 0;
      return { ...item, weight: Math.max(1, 10 - errorCount) };
    });

    const totalWeight = weightedWords.reduce(
      (sum, item) => sum + item.weight,
      0
    );
    let random = Math.random() * totalWeight;
    let selectedWord = null;

    for (const item of weightedWords) {
      random -= item.weight;
      if (random <= 0) {
        selectedWord = item;
        break;
      }
    }

    setCurrentWord(selectedWord);
    setUserTranslation("");
    setMessage("");
    setInputBorderColor("border-gray-300");
    setShowCorrectAnswer(false);
    setWaitingForCheck(false);
  };

  const checkTranslation = () => {
    if (!currentWord || waitingForCheck) return;

    const correctAnswer = isFrenchToEnglish ? currentWord.en : currentWord.fr;
    const normalizedUserTranslation = normalizeString(userTranslation.trim());
    const normalizedCorrectAnswer = normalizeString(correctAnswer);

    const regex = new RegExp(
      `^${normalizedCorrectAnswer
        .replace(/[a-z]/g, "[a-z]")
        .replace(/'/g, "['’]?")
        .replace(/ /g, "\\s*")}$`,
      "i"
    );

    const key = isFrenchToEnglish ? currentWord.fr : currentWord.en;

    if (regex.test(normalizedUserTranslation)) {
      setMessage("Correct!");
      setInputBorderColor("border-green-500");
      setTimeout(() => {
        pickRandomWord();
      }, 200);
    } else {
      setMessage("Incorrect.");
      setInputBorderColor("border-red-500");
      setShowCorrectAnswer(true);
      const updatedCounts = {
        ...errorCounts,
        [key]: (errorCounts[key] || 0) + 1,
      };
      setErrorCounts(updatedCounts);
      saveErrorCounts(updatedCounts);
      setWaitingForCheck(true);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      checkTranslation();
    }
  };

  const handleNextWord = () => {
    if (waitingForCheck) {
      pickRandomWord();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Learn English</h1>
      <div className="mb-4">
        <label className="inline-flex items-center cursor-pointer">
          <span className="mr-2">French to English</span>
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-blue-600"
            checked={isFrenchToEnglish}
            onChange={() => setIsFrenchToEnglish(!isFrenchToEnglish)}
          />
          <span className="ml-2">English to French</span>
        </label>
      </div>
      {currentWord && (
        <div className="bg-white p-6 rounded shadow-md w-96">
          <p className="text-xl mb-4">
            {isFrenchToEnglish ? currentWord.fr : currentWord.en}
          </p>
          <input
            type="text"
            className={`border p-2 w-full mb-4 ${inputBorderColor} transition-colors duration-200`}
            placeholder={
              isFrenchToEnglish
                ? "Enter English translation"
                : "Enter French translation"
            }
            value={userTranslation}
            onChange={(e) => setUserTranslation(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={waitingForCheck}
          />
          {showCorrectAnswer && (
            <p className="text-red-500 mb-2">
              Correct answer:{" "}
              {isFrenchToEnglish ? currentWord.en : currentWord.fr}
            </p>
          )}
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              checkTranslation();
              handleNextWord();
            }}
            disabled={!waitingForCheck && inputBorderColor === "border-red-500"}
          >
            Check
          </button>
          {message && <p className="mt-2">{message}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
