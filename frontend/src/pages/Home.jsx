import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Home() {
  return (
    <>
      <Header />
      <section className="home">
        <div className="homecontent">
          <h1>Where Curiosity Meets Excellence</h1>
          <h3></h3>
          <p>
            Discover engaging quizzes designed to help you learn faster,
            remember better, and achieve your academic goals
          </p>
          <div className="button">
            <Link to="/startquiz"><button className="first">Start Quiz</button></Link>
            <a href="https://claude.ai"><button className="second">Let's Talk with AI</button></a>
          </div>

          <div className="homescreen">
            <a href="#"><i className="bx bxl-facebook-circle"></i></a>
            <a href="#"><i className="bx bxl-instagram"></i></a>
            <a href="#"><i className="bx bxl-twitter"></i></a>
          </div>
        </div>
      </section>
    </>
  );
}
