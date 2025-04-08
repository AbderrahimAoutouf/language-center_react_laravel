import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { Card, Alert, Col } from 'react-bootstrap';
import { UseStateContext } from "../../context/ContextProvider";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

export default function ContentLayout() {
  const { token, notification, variant, user } = UseStateContext();
  const location = useLocation();
  
  // Parse path segments for breadcrumb
  const pathSegments = location.pathname.split('/').filter(segment => segment);
  
  // Format for title
  var replaced = location.pathname.slice(1).replace("_", " ").replaceAll("/", " ").replace(/\b\w/g, c => c.toUpperCase());
  replaced = replaced.charAt(0).toUpperCase() + replaced.slice(1).toLowerCase();
  
  // Get first word for main title
  const words = replaced.split(" ");
  let result = "";
  for (let i = 0; i < 1 && i < words.length; i++) {
    result += words[i] + " ";
  }
  
  // Toast notifications
  if (variant === "success") toast.success(notification);
  if (variant === "danger") toast.error(notification);
  if (variant === "warning") toast.warn(notification);
  
  const dashboardstyle = {
    backgroundColor: "#F1F1F3"
  };
  const style = location.pathname === "/dashboard" ? dashboardstyle : "";
  
  // Get route prefix based on user role
  const getRoutePrefix = () => {
    if (user && user.role === "admin") {
      return "";
    } else if (user && user.role === "director") {
      return "/director";
    } else {
      return "/secretary";
    }
  };
  
  const routePrefix = getRoutePrefix();
  
  // Generate correct breadcrumb paths based on application structure
  const generateBreadcrumbPaths = () => {
    const result = [];
    let currentPath = "";
    
    // Always start with home/dashboard
    result.push({
      name: "Home",
      path: `${routePrefix}/dashboard`,
      isActive: false,
      isLast: false
    });
    
    // Skip the first segment if it's "dashboard" or matches the role prefix
    // since we already added Home
    const startIndex = pathSegments[0] === "dashboard" ||
                      pathSegments[0] === "director" ||
                      pathSegments[0] === "secretary" ? 1 : 0;
    
    for (let i = startIndex; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      
      // Add previous segments to the path
      if (i > startIndex) {
        currentPath += "/" + pathSegments[i-1];
      } else {
        currentPath = routePrefix;
      }
      
      // Format the segment name for display
      let name = segment;
      if (!isNaN(segment)) {
        name = segment; // Keep IDs as they are
      } else {
        name = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
      }
      
      // Add to result
      result.push({
        name: name,
        path: `${currentPath}/${segment}`,
        isActive: i === pathSegments.length - 1,
        isLast: i === pathSegments.length - 1,
        isNumeric: !isNaN(segment)
      });
    }
    
    return result;
  };
  
  const breadcrumbPaths = generateBreadcrumbPaths();
  
  if (!token) return <Navigate to="/auth" />;
  
  return (
    <div className="d-flex flex-row w-100">
      <Sidebar />
      <div className="w-100 m-0">
        <Topbar />
        <div className="contents w-100">
          <div className="p-4">
            <h1 className="fw-semibold fs-3 mb-1 w-auto text-start">{result}</h1>
            <div style={{width:"4%", height:0, border: "2px solid red"}}></div>
            
            {/* Custom Breadcrumb Navigation with ">" separator */}
            <div className="pt-4 d-flex flex-row align-items-center">
              {breadcrumbPaths.map((item, index) => (
                <div key={index} className="d-flex align-items-center">
                  {index > 0 && (
                    <span className="text-danger fw-semibold mx-2">&gt;</span>
                  )}
                  
                  {item.isLast || item.isNumeric ? (
                    <span 
                      className={`${index === 0 ? 'text-secondary' : 'text-danger fw-semibold'}`}
                      style={index === 0 ? {fontFamily: "regular", fontSize: "18px"} : {}}
                    >
                      {item.name}
                    </span>
                  ) : (
                    <Link 
                      to={item.path}
                      className={`${index === 0 ? 'text-secondary' : 'text-danger fw-semibold'}`}
                      style={{
                        textDecoration: "none", 
                        ...(index === 0 ? {fontFamily: "regular", fontSize: "18px"} : {})
                      }}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
            
            {notification !== '' &&
              <Col xs={12} className="d-flex justify-content-end">
                <ToastContainer />
              </Col>
            }
            
            <Card className="mt-3" style={{borderRadius: "0", border:"0", ...style}}>
              <Card.Body>
                <Outlet />
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}