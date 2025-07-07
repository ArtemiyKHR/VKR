import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import Messages from "./pages/Messages";


function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/messages" element={<Messages />} />
            </Routes>
        </Router>
    );
}

export default App;
