import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ReviewForm = () => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [emailError, setEmailError] = useState("");

  const navigate = useNavigate();

  const badWords = [
    "badword1", "badword2", "stupid", "idiot", "fool", "nonsense",
    "dumb", "trash", "loser", "moron", "bastard", "sucker", "silly",
    "crap", "screw", "shit", "fuck", "fucking", "ass", "asshole",
    "bitch", "damn", "bloody", "retard", "piss", "dick", "cock",
    "pussy", "slut", "whore", "hell", "suck", "jerk", "motherfucker",
    "son of a bitch", "bullshit", "arse", "wanker", "cunt", "prick",
    "wtf", "fml", "fk", "stfu", "omfg", "gtfo", "suckmydick",
  "nutjob", "twat", "bugger", "bollocks", "numbnuts", "shitface",
  "dipshit", "numbnut", "shithole", "shitbag", "scumbag",
  "douchebag", "jackass", "pisshead", "asswipe", "fuckhead",
  "fuckface", "shitfaced", "dumbfuck", "cockhead", "bastardo",
  "skank", "hoe", "scrote", "fuckwad", "fuckstick", "shitstick",
  "jerkwad", "twatwaffle", "assclown", "fuckhole", "balllicker",
  "shitstain", "cocksucker", "shitbrain", "cumdumpster",
  "fag", "faggot", "tranny", "queer", "dyke", "gaylord",
  "kunt", "twit", "pecker", "wang", "schlong", "douche",
  "knob", "arsewipe", "tard", "mong", "beaner", "spic",
  "chink", "gook", "paki", "camel jockey", "towelhead",
  "sandnigger", "nigga", "nigger", "negro", "coon", "darkie",
  "cracker", "redneck", "hillbilly", "wetback", "gringo",
  "retarded", "cripple", "invalid", "fatass", "lardass",
  "fatso", "chunky", "blubber", "ugly", "minger", "slapper",
  "dickhead", "arsehole", "shithead", "fucktard", "bitchass",
  "fuckboy", "fucker", "arseface", "dipshit", "pissface",
  "assmaster", "goddamn", "shitload", "fuckload", "buttfuck",
  "ballbag", "cuntface", "pissflaps", "fucknugget",
  "shitlord", "pisspants", "cockmuncher", "fuckmuppet",
  "cumbubble", "jizz", "jizzmopper", "dickweed", "cumstain",
  "pissbucket", "fuckface", "shitlicker", "asshat",
  "fuckmeat", "shitweasel", "fucktard", "dumbass",
  "twatwaffle", "fudgewagon", "shart", "shitter",
  "dickless", "cockmongler", "assboner", "cockbite",
  "shitstorm", "pussbucket", "ballsack", "knobhead",
  "fartknocker", "shitbird", "pissrat", "pissmonger",
  "scumbucket", "nutlicker", "shitpile", "cocknose",
  "shitbreath", "fuckbucket", "fudgewit", "twatwaffle",
  "shitpants", "assdouche", "bastardface", "cuntbag",
  "asscock", "fuckyourself", "cocksmoker", "pisslord",
  "shitmouth", "pissdrinker", "cocksnot", "asscrack",
  "fuckwagon", "dickwagon", "arsecrumpet", "knobjockey",
  "cockwaffle", "arsemonkey", "pissclown", "cumrocket",
  "shithouse", "dickbrains", "cocknugget", "fuckbiscuit",
  "arsegremlin", "fuckwhistle", "knobgoblin", "cumguzzler",
  "shitgibbon", "cockwomble", "fucktwit", "cockwrench",
  "douchecanoe", "knobjob", "fuckwhit", "shitlord",
  "cumbucket", "twatstick", "arsepimple", "fuckplank",
  "shitmuffin", "arsewizard", "asspirate", "fuckpuddle",
  "cockslap", "fucktangle", "shitface", "bollockhead",
  "arselicker", "cocksplat", "fucksprout", "shitshovel",
  "knobmonkey", "shitsplat", "twatsplat", "twatdangle",

  "huththo","pakaya","wesi","hukapan","balli","pakaya","huththi","kariya","huththige putha","ponnaya","kari","puka",
  "huththo","pakaya","wesi","hukapan","balli","pakaya","huththi","kariya","huththige putha",
  "ponnaya","kari","puka", "kunu", "ballek", "gon", "harupa", "modaya", "yakadaya", "pissu",
   "kunu", "kunu harupa", "yakko", "moda", "gon", "baya", "paraya",
  "mala", "muhuda", "uththare", "gembek", "harupa", "buruwa", "uruma",
  "ethakota umba", "harak", "magema amma", "kariya", "huththi", "puka",
  "kudda", "thaniya", "kalakanni", "wehi", "siyalu", "pakaya", "thadiya",
  "sudu akka", "gon haraka", "thadi amma", "heena", "ethuma", "kurutta",
  "mara pissu", "saththu", "yanna", "yanna pissu", "gona", "unna", "uda",
  "umbata", "tho", "thopi","bijja","lodaya","wesa","lolla"
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setEmail(userObj.email);
    }
  }, []);

  const emailPattern = /^[a-z]+[a-z0-9]*@gmail\.com$/;

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setEmailError(!emailPattern.test(newEmail) ? "Must be a valid Gmail address (e.g., user@gmail.com)." : "");
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  const handleImageUpload = (event) => {
    setImage(event.target.files[0]);
  };

  const isToxic = async (text) => {
    try {
      const response = await axios.post(
        "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=AIzaSyDDWGVW_1loLyHNEvW3bBeQIrMV_rGnBqQ",
        {
          comment: { text },
          requestedAttributes: { TOXICITY: {} },
          languages: ["en", "si"],
        }
      );

      const score = response.data?.attributeScores?.TOXICITY?.summaryScore?.value;
      return score >= 0.7;
    } catch (err) {
      console.error("Perspective API error:", err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailError) {
      alert("Please fix email validation errors before submitting.");
      return;
    }

    const fullText = `${title} ${review}`.toLowerCase();
    const foundBadWord = badWords.find(word => fullText.includes(word));
    if (foundBadWord) {
      alert("Inappropriate language detected. Please revise your review.");
      return;
    }

    const toxic = await isToxic(fullText);
    if (toxic) {
      alert("Toxic content detected. Please revise your review.");
      return;
    }

    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("title", title);
    formData.append("review", review);
    formData.append("email", email);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await axios.post("http://localhost:5000/api/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert(response.data.message);
      navigate("/reviewspage", { replace: true });

      setRating(0);
      setTitle("");
      setReview("");
      setImage(null);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen bg-gray-100"
      style={{
        backgroundImage: "url('/ReviewFormBackground.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg bg-opacity-90">
        <h2 className="text-xl font-semibold text-center mb-4">Add Review and Ratings</h2>

        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={30}
              className={`cursor-pointer mx-1 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
              onClick={() => handleRatingClick(star)}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Review Title"
            className="w-full p-2 border rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Describe your review..."
            className="w-full p-2 border rounded-lg h-24"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            required
          />

          <input
            type="file"
            className="w-full p-2 border rounded-lg"
            onChange={handleImageUpload}
          />

          <input
            type="email"
            placeholder="Your e-mail address"
            className={`w-full p-2 border rounded-lg ${emailError ? "border-red-500" : "border-gray-300"}`}
            value={email}
            onChange={handleEmailChange}
            required
            disabled
          />
          {emailError && <p className="text-red-500 text-sm">{emailError}</p>}

          <button
            type="submit"
            className="w-full bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 transition duration-200"
          >
            Add Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;