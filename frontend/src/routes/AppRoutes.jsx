import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/layout/AdminLayout";

// Student Pages
import Home from "../pages/Home";
import Buynow from "../pages/Buynow";
import Applynow from "../pages/Student/Applynow";

import Dashboard from "../pages/DigitalPart/Dashboard";
import Profile from "../pages/DigitalPart/Profile";
import PaymentInfo from "../pages/DigitalPart/PaymentInfo";
import PortalRegistration from "../pages/DigitalPart/PortalRegistration";
import MyCourses from "../pages/DigitalPart/MyCourses";
import StudentResults from "../pages/DigitalPart/StudentResults";
import Notices from "../pages/DigitalPart/Notices";
import Schedule from "../pages/DigitalPart/Schedule";
import Chats from "../pages/DigitalPart/Chats";
import ProtectedRoute from "../components/ProtectedRoute";
import NotFound from "../pages/Notfound/NotFound";
import Foundation from "../pages/Courses/Foundation";
import AllIndia from "../pages/Courses/AllIndia";
import Boards from "../pages/Courses/Boards";
import Alumni from "../pages/Alumni";
import StudentsCorner from "../pages/StudentsCorner";
import StudentBag from "../pages/StudentBag";
import StudentCheckout from "../pages/StudentCheckout";
import StudentCornerOrders from "../pages/StudentCornerOrders";

// Result Pages
import FoundationResult from "../pages/Results/Foundation";
import AllIndiaResult from "../pages/Results/AllIndia";
import BoardsResult from "../pages/Results/Boards";

// Admin Components
import AdminLogin from "../components/auth/AdminLogin";
import AdminForgotPassword from "../components/auth/AdminForgotPassword";
import AdminResetPassword from "../components/auth/AdminResetPassword";
import AdminRegisterWithInvite from "../components/auth/AdminRegisterWithInvite";
import AdminDashboard from "../components/admin/AdminDashboard";
import CourseList from "../components/admin/CourseList";
import CourseCreate from "../components/admin/CourseCreate";
import CourseEdit from "../components/admin/CourseEdit";
import AdminManagement from "../components/admin/AdminManagement";
import UsersManagement from "../components/admin/UsersManagement";
import AdminSettings from "../components/admin/AdminSettings";
import AdminProtectedRoute from "../components/common/AdminProtectedRoute";
import SuperAdminProtectedRoute from "../components/common/SuperAdminProtectedRoute";

// Centre Components
import CentreList from "../components/admin/CentreList";
import CentreCreate from "../components/admin/CentreCreate";
import CentreEdit from "../components/admin/CentreEdit";

// Job Components - ADD THESE IMPORTS
import JobManagement from "../components/admin/JobManagement";
import JobPostForm from "../components/admin/JobPostForm";
import JobApplicationList from "../components/admin/JobApplicationList";
import Career from "../pages/Career";
import JobDetail from "../pages/JobDetail";
import JobApplication from "../pages/JobApplication";
import CentreDetailPage from "../pages/Centres/CentreDetail";
import ApplicantsList from "../components/admin/ApplicantsList";
import AlumniManagement from "../components/admin/AlumniManagement";
import StudentCornerManagement from "../components/admin/StudentCornerManagement";
import BlogManagement from "../components/admin/BlogManagement";
import AdsLeadsList from "../components/admin/AdsLeadsList";
import Centres from "../pages/Centres/Centres";
import ContactUs from "../pages/ContactUs";
import Blog from "../pages/Blog";
import BlogPostDetail from "../pages/BlogPostDetail";
import AboutUs from "../pages/About/AboutUs";
import CEOMessage from "../pages/About/CEOMessage";
import ChairmanMessage from "../pages/About/ChairmanMessage";
import Franchise from "../pages/Franchise";
import { AllIndiaLandingPage } from "../pages/add_landingpage/pages/Jeelandingpage";
import { Neetlandingpage } from "../pages/add_landingpage/pages/Neetlandingpage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Student Routes with Main Layout */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />

      <Route
        path="/applynow"
        element={
          <MainLayout>
            <Applynow />
          </MainLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PaymentInfo />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/portal-registration"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PortalRegistration />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-courses"
        element={
          <ProtectedRoute>
            <MainLayout>
              <MyCourses />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-results"
        element={
          <ProtectedRoute>
            <MainLayout>
              <StudentResults />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Notices />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Schedule />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Chats />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/alumni"
        element={
          <MainLayout>
            <Alumni />
          </MainLayout>
        }
      />
      <Route
        path="/centres"
        element={
          <MainLayout>
            <Centres />
          </MainLayout>
        }
      />
      <Route
        path="/centres/:id"
        element={<CentreDetailPage />}
      />
      <Route
        path="/students-corner/checkout"
        element={
          <MainLayout>
            <StudentCheckout />
          </MainLayout>
        }
      />
      <Route
        path="/students-corner/bag"
        element={
          <MainLayout>
            <StudentBag />
          </MainLayout>
        }
      />
      <Route
        path="/students-corner/orders"
        element={
          <ProtectedRoute>
            <MainLayout>
              <StudentCornerOrders />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/students-corner"
        element={
          <MainLayout>
            <StudentsCorner />
          </MainLayout>
        }
      />
      <Route
        path="/sc-test"
        element={
          <MainLayout>
            <StudentCheckout />
          </MainLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <MainLayout>
            <ContactUs />
          </MainLayout>
        }
      />
      <Route
        path="/blog"
        element={
          <MainLayout>
            <Blog />
          </MainLayout>
        }
      />
      <Route
        path="/blog/:slug"
        element={
          <MainLayout>
            <BlogPostDetail />
          </MainLayout>
        }
      />
      <Route
        path="/about-us"
        element={
          <MainLayout>
            <AboutUs />
          </MainLayout>
        }
      />
      <Route
        path="/ceo-message"
        element={
          <MainLayout>
            <CEOMessage />
          </MainLayout>
        }
      />
      <Route
        path="/chairman-message"
        element={
          <MainLayout>
            <ChairmanMessage />
          </MainLayout>
        }
      />
      <Route
        path="/franchise"
        element={
          <MainLayout>
            <Franchise />
          </MainLayout>
        }
      />

      {/* Ads Landing Pages */}
      <Route
        path="/apply_now/allindia/jee"
        element={<AllIndiaLandingPage />}
      />
      <Route
        path="/apply_now/allindia/neet"
        element={<Neetlandingpage />}
      />

      {/* Protected Student Routes with Main Layout */}
      <Route
        path="/buynow"
        element={
          <MainLayout>
            <Buynow />
          </MainLayout>
        }
      />

      {/* Admin Auth Routes (No Layout - they have their own styling) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/admin/reset-password" element={<AdminResetPassword />} />
      <Route
        path="/admin/register/:token"
        element={<AdminRegisterWithInvite />}
      />

      {/* Protected Admin Routes with Admin Layout */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute requiredPermission="view_dashboard">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Courses Routes */}
      <Route
        path="/admin/courses"
        element={
          <AdminProtectedRoute requiredPermission="manage_courses">
            <AdminLayout>
              <CourseList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/create"
        element={
          <AdminProtectedRoute requiredPermission="manage_courses">
            <AdminLayout>
              <CourseCreate />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:id/edit"
        element={
          <AdminProtectedRoute requiredPermission="manage_courses">
            <AdminLayout>
              <CourseEdit />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Centres Routes */}
      <Route
        path="/admin/centres"
        element={
          <AdminProtectedRoute requiredPermission="manage_courses">
            <AdminLayout>
              <CentreList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/centres/create"
        element={
          <AdminProtectedRoute requiredPermission="manage_courses">
            <AdminLayout>
              <CentreCreate />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/centres/:id/edit"
        element={
          <AdminProtectedRoute requiredPermission="manage_courses">
            <AdminLayout>
              <CentreEdit />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Job Management Routes - ADD THESE */}
      <Route
        path="/admin/jobs"
        element={
          <AdminProtectedRoute requiredPermission="manage_applications">
            <AdminLayout>
              <JobManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs/create"
        element={
          <AdminProtectedRoute requiredPermission="manage_applications">
            <AdminLayout>
              <JobPostForm />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/jobs/edit/:id"
        element={
          <AdminProtectedRoute requiredPermission="manage_applications">
            <AdminLayout>
              <JobPostForm />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <AdminProtectedRoute requiredPermission="manage_applications">
            <AdminLayout>
              <JobApplicationList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/course-applications"
        element={
          <AdminProtectedRoute requiredPermission="manage_applications">
            <AdminLayout>
              <ApplicantsList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/ads-leads"
        element={
          <AdminProtectedRoute requiredPermission="manage_applications">
            <AdminLayout>
              <AdsLeadsList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Alumni Management */}
      <Route
        path="/admin/alumni"
        element={
          <AdminProtectedRoute requiredPermission="manage_courses">
            <AdminLayout>
              <AlumniManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Student Corner Management */}
      <Route
        path="/admin/student-corner"
        element={
          <AdminProtectedRoute requiredPermission="manage_courses">
            <AdminLayout>
              <StudentCornerManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/admin/blog"
        element={
          <AdminProtectedRoute requiredPermission="manage_blogs">
            <AdminLayout>
              <BlogManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Users Management */}
      <Route
        path="/admin/users"
        element={
          <AdminProtectedRoute requiredPermission="manage_users">
            <AdminLayout>
              <UsersManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Admin Management (Super Admin Only) */}
      <Route
        path="/admin/management"
        element={
          <SuperAdminProtectedRoute>
            <AdminLayout>
              <AdminManagement />
            </AdminLayout>
          </SuperAdminProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/admin/settings"
        element={
          <AdminProtectedRoute requiredPermission="view_dashboard">
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Redirect /admin to /admin/dashboard */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      {/* Course Pages */}
      <Route
        path="/courses/foundation"
        element={
          <MainLayout>
            <Foundation />
          </MainLayout>
        }
      />
      <Route
        path="/courses/all-india"
        element={
          <MainLayout>
            <AllIndia />
          </MainLayout>
        }
      />
      <Route
        path="/courses/boards"
        element={
          <MainLayout>
            <Boards />
          </MainLayout>
        }
      />


      <Route
        path="/career"
        element={
          <MainLayout>
            <Career />
          </MainLayout>
        }
      />
      <Route
        path="/career/job/:id"
        element={
          <MainLayout>
            <JobDetail />
          </MainLayout>
        }
      />
      <Route
        path="/career/apply/:id"
        element={
          <MainLayout>
            <JobApplication />
          </MainLayout>
        }
      />

      {/* Result Pages */}
      <Route
        path="/results/foundation"
        element={
          <MainLayout>
            <FoundationResult />
          </MainLayout>
        }
      />
      <Route
        path="/results/all-india"
        element={
          <MainLayout>
            <AllIndiaResult />
          </MainLayout>
        }
      />
      <Route
        path="/results/boards"
        element={
          <MainLayout>
            <BoardsResult />
          </MainLayout>
        }
      />

      {/* 404 Page with Main Layout but NO Header and Footer */}
      <Route
        path="*"
        element={
          <MainLayout showHeader={false} showFooter={false}>
            <NotFound />
          </MainLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
