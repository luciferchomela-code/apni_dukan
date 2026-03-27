import { useEffect } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAppData();

  useEffect(() => {
    if (!loading && user?.role === "seller") {
      navigate("/shop"); 
    }
  }, [user, loading, navigate]);

  if (loading) return null; 

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Customer Home Page</h1>
      <p>Welcome to Apni Dukan</p>
    </div>
  );
};

export default Home;