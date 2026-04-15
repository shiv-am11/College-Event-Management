import { useEffect, useState } from "react";
import axios from "axios";

import { CTASection } from "../Components/CTASection";
import FeaturesSection from "../Components/FeaturesSection";
import Footer from "../Components/Footer";
import HeroSection from "../Components/HeroSection";
import HowItWorksSection from "../Components/HowItWorks";
import Navbar from "../Components/Navbar";
import UpcomingEventsSection from "../Components/UpcomingEventSection";

const HomePage = () => {

  const [backendMsg, setBackendMsg] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/test")
      .then((res) => {
        console.log("Backend Response 👉", res.data);
        setBackendMsg(res.data.message);
      })
      .catch((err) => {
        console.error("Backend not connected ❌", err);
      });
  }, []);

  return (
    <div>
      <Navbar />     
      <HeroSection />
      <section id="features">
      <FeaturesSection />
      </section>
      <section id="how-it-works">
      <HowItWorksSection />
      </section>
      <UpcomingEventsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
