import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminProtectedRoute from "../components/common/AdminProtectedRoute";
import SuperAdminProtectedRoute from "../components/common/SuperAdminProtectedRoute";

// Core Entry Page (synchronous for instantaneous first render)
import Home from "../pages/Home";

// Helper for dynamic imports with named exports fallback
const lazyNamed = (importFn, exportName) =>
  lazy(() =>
    importFn().then((mod) => ({
      default: mod[exportName] || mod.default,
    }))
  );

// Student Pages (Lazy Loaded)
const Buynow = lazy(() => import("../pages/Buynow"));
const PaymentStatus = lazy(() => import("../pages/PaymentStatus"));
const Applynow = lazy(() => import("../pages/Student/Applynow"));
const MockTests = lazy(() => import("../pages/Student/MockTests"));

const Dashboard = lazy(() => import("../pages/DigitalPart/Dashboard"));
const Profile = lazy(() => import("../pages/DigitalPart/Profile"));
const PaymentInfo = lazy(() => import("../pages/DigitalPart/PaymentInfo"));
const PortalRegistration = lazy(() => import("../pages/DigitalPart/PortalRegistration"));
const MyCourses = lazy(() => import("../pages/DigitalPart/MyCourses"));
const StudentResults = lazy(() => import("../pages/DigitalPart/StudentResults"));
const Notices = lazy(() => import("../pages/DigitalPart/Notices"));
const Schedule = lazy(() => import("../pages/DigitalPart/Schedule"));
const Chats = lazy(() => import("../pages/DigitalPart/Chats"));
const PhysicalAssets = lazy(() => import("../pages/DigitalPart/PhysicalAssets"));
const NotFound = lazy(() => import("../pages/Notfound/NotFound"));
const CustomPageRenderer = lazy(() => import("../pages/CustomPageRenderer"));
const Foundation = lazy(() => import("../pages/Courses/Foundation"));
const AllIndia = lazy(() => import("../pages/Courses/AllIndia"));
const Boards = lazy(() => import("../pages/Courses/Boards"));
const Alumni = lazy(() => import("../pages/Alumni"));
const StudentsCorner = lazy(() => import("../pages/StudentsCorner"));
const StudentBag = lazy(() => import("../pages/StudentBag"));
const StudentCheckout = lazy(() => import("../pages/StudentCheckout"));
const StudentCornerOrders = lazy(() => import("../pages/StudentCornerOrders"));

// Result Pages (Lazy Loaded)
const FoundationResult = lazy(() => import("../pages/Results/Foundation"));
const AllIndiaResult = lazy(() => import("../pages/Results/AllIndia"));
const BoardsResult = lazy(() => import("../pages/Results/Boards"));

// Admin Components (Lazy Loaded)
const AdminLogin = lazy(() => import("../components/auth/AdminLogin"));
const AdminForgotPassword = lazy(() => import("../components/auth/AdminForgotPassword"));
const AdminResetPassword = lazy(() => import("../components/auth/AdminResetPassword"));
const AdminRegisterWithInvite = lazy(() => import("../components/auth/AdminRegisterWithInvite"));
const AdminDashboard = lazy(() => import("../components/admin/AdminDashboard"));
const CourseList = lazy(() => import("../components/admin/CourseList"));
const CourseCreate = lazy(() => import("../components/admin/CourseCreate"));
const CourseEdit = lazy(() => import("../components/admin/CourseEdit"));
const AdminManagement = lazy(() => import("../components/admin/AdminManagement"));
const UsersManagement = lazy(() => import("../components/admin/UsersManagement"));
const AdminSettings = lazy(() => import("../components/admin/AdminSettings"));
const MockTestsManagement = lazy(() => import("../components/admin/MockTestsManagement"));
const CounsellingBookingsList = lazy(() => import("../components/admin/CounsellingBookingsList"));

// Centre Components (Lazy Loaded)
const CentreList = lazy(() => import("../components/admin/CentreList"));
const CentreCreate = lazy(() => import("../components/admin/CentreCreate"));
const CentreEdit = lazy(() => import("../components/admin/CentreEdit"));

// Job & Management Components (Lazy Loaded)
const JobManagement = lazy(() => import("../components/admin/JobManagement"));
const JobPostForm = lazy(() => import("../components/admin/JobPostForm"));
const JobApplicationList = lazy(() => import("../components/admin/JobApplicationList"));
const Career = lazy(() => import("../pages/Career"));
const JobDetail = lazy(() => import("../pages/JobDetail"));
const JobApplication = lazy(() => import("../pages/JobApplication"));
const CentreDetailPage = lazy(() => import("../pages/Centres/CentreDetail"));
const ApplicantsList = lazy(() => import("../components/admin/ApplicantsList"));
const AlumniManagement = lazy(() => import("../components/admin/AlumniManagement"));
const StudentCornerManagement = lazy(() => import("../components/admin/StudentCornerManagement"));
const BlogManagement = lazy(() => import("../components/admin/BlogManagement"));
const AnnouncementManagement = lazy(() => import("../components/admin/AnnouncementManagement"));
const WBJEEAnalysisManagement = lazy(() => import("../components/admin/WBJEEAnalysisManagement.jsx"));
const NEETAnalysisManagement = lazy(() => import("../components/admin/NEETAnalysisManagement.jsx"));
const JEEAnalysisManagement = lazy(() => import("../components/admin/JEEAnalysisManagement.jsx"));
const CustomPagesManagement = lazy(() => import("../components/admin/CustomPagesManagement.jsx"));
const AdsLeadsList = lazy(() => import("../components/admin/AdsLeadsList"));
const ShikshaHubManagement = lazy(() => import("../components/admin/ShikshaHubManagement.jsx"));
const ShikshaProductsManagement = lazy(() => import("../components/admin/ShikshaProductsManagement.jsx"));
const FranchiseInquiryList = lazy(() => import("../components/admin/FranchiseInquiryList"));
const PopupManagement = lazy(() => import("../components/admin/PopupManagement"));
const Centres = lazy(() => import("../pages/Centres/Centres"));
const ContactUs = lazy(() => import("../pages/ContactUs"));
const Blog = lazy(() => import("../pages/Blog"));
const BlogPostDetail = lazy(() => import("../pages/BlogPostDetail"));
const WBJEEAnswerKey = lazy(() => import("../pages/WBJEEAnswerKey"));
const NEETAnswerKey = lazy(() => import("../pages/NEETAnswerKey"));
const JEEAnswerKey = lazy(() => import("../pages/JEEAnswerKey"));
const AboutUs = lazy(() => import("../pages/About/AboutUs"));
const CEOMessage = lazy(() => import("../pages/About/CEOMessage"));
const ChairmanMessage = lazy(() => import("../pages/About/ChairmanMessage"));
const Franchise = lazy(() => import("../pages/Franchise"));

// Landing Pages (Named Exports)
const Jeelandingpage = lazyNamed(() => import("../pages/add_landingpage/pages/Jeelandingpage"), "Jeelandingpage");
const Neetlandingpage = lazyNamed(() => import("../pages/add_landingpage/pages/Neetlandingpage"), "Neetlandingpage");
const Clatlandingpage = lazyNamed(() => import("../pages/add_landingpage/pages/Clatlandingpage"), "Clatlandingpage");
const Paislandingpage = lazyNamed(() => import("../pages/add_landingpage/pages/Paislandingpage"), "Paislandingpage");
const MockTestLandingPage = lazyNamed(() => import("../pages/add_landingpage/pages/MockTestLandingPage"), "MockTestLandingPage");
const FoundationLandingPage = lazyNamed(() => import("../pages/add_landingpage/pages/FoundationLandingPage"), "FoundationLandingPage");
const PmoLandingPage = lazyNamed(() => import("../pages/add_landingpage/pages/PmoLandingPage"), "PmoLandingPage");
const PmtseLandingPage = lazyNamed(() => import("../pages/add_landingpage/pages/PmtseLandingPage"), "PmtseLandingPage");

// Policy Pages & Demo
const Pais = lazy(() => import("../pages/Pais"));
const TermsAndConditions = lazy(() => import("../pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const CancellationPolicy = lazy(() => import("../pages/CancellationPolicy"));
const RefundPolicy = lazy(() => import("../pages/RefundPolicy"));
const ICICIPaymentDemo = lazyNamed(() => import("../pages/ICICIPaymentDemo"), "ICICIPaymentDemo");

// PAIS Portal Pages (Named Exports)
const PaisLogin = lazyNamed(() => import("../pages/pais/PaisLogin"), "PaisLogin");
const PaisDashboard = lazyNamed(() => import("../pages/pais/PaisDashboard"), "PaisDashboard");
const PaisExamEngine = lazyNamed(() => import("../pages/pais/PaisExamEngine"), "PaisExamEngine");
const PaisAdminManagement = lazyNamed(() => import("../components/admin/PaisAdminManagement"), "PaisAdminManagement");

// Shiksha Bandhu Pages (Named Exports)
const ShikshaBandhuLogin = lazyNamed(() => import("../pages/shiksha_bandhu/ShikshaBandhuLogin"), "ShikshaBandhuLogin");
const ShikshaBandhuDashboard = lazyNamed(() => import("../pages/shiksha_bandhu/ShikshaBandhuDashboard"), "ShikshaBandhuDashboard");
const ShikshaBandhuMockTests = lazyNamed(() => import("../pages/shiksha_bandhu/ShikshaBandhuMockTests"), "ShikshaBandhuMockTests");
const ShikshaBandhuReferrals = lazyNamed(() => import("../pages/shiksha_bandhu/ShikshaBandhuReferrals"), "ShikshaBandhuReferrals");
const ShikshaBandhuEarnings = lazyNamed(() => import("../pages/shiksha_bandhu/ShikshaBandhuEarnings"), "ShikshaBandhuEarnings");
const ShikshaBandhuProfile = lazyNamed(() => import("../pages/shiksha_bandhu/ShikshaBandhuProfile"), "ShikshaBandhuProfile");
const PublicReferralLanding = lazyNamed(() => import("../pages/shiksha_bandhu/PublicReferralLanding"), "PublicReferralLanding");

// Subtle loading spinner for async route transitions
const PageLoadingFallback = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <span className="mt-3 text-xs font-semibold tracking-wider text-gray-400 uppercase">Loading...</span>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
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
        path="/physical-assets"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PhysicalAssets />
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
          <MainLayout>
            <StudentCornerOrders />
          </MainLayout>
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
        path="/wbjee-answer-key"
        element={
          <MainLayout>
            <WBJEEAnswerKey />
          </MainLayout>
        }
      />
      <Route
        path="/neet-answer-key"
        element={
          <MainLayout>
            <NEETAnswerKey />
          </MainLayout>
        }
      />
      <Route
        path="/jee-answer-key"
        element={
          <MainLayout>
            <JEEAnswerKey />
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
        element={<Jeelandingpage />}
      />
      <Route
        path="/apply_now/allindia/neet"
        element={<Neetlandingpage />}
      />
      <Route
        path="/mock-test-program"
        element={
          <MainLayout showFooter={false}>
            <CustomPageRenderer slug="mock-test-program" />
          </MainLayout>
        }
      />
      <Route
        path="/competitive-exam-programme"
        element={
          <MainLayout showFooter={false}>
            <CustomPageRenderer slug="competitive-exam-programme" />
          </MainLayout>
        }
      />
      <Route
        path="/cbse-mock-test-program"
        element={<MockTestLandingPage boardType="cbse" isVersionTwo={true} />}
      />
      <Route
        path="/cbse-mock-test-program-2"
        element={<MockTestLandingPage boardType="cbse" isVersionTwo={true} />}
      />
      <Route
        path="/icse-isc-mock-test-program"
        element={<MockTestLandingPage boardType="icse" isVersionTwo={true} />}
      />
      <Route
        path="/wb-board-mock-test-program"
        element={<MockTestLandingPage boardType="wb" isVersionTwo={true} />}
      />
      <Route
        path="/madhyamik-mock-test-program"
        element={<MockTestLandingPage boardType="wb" isVersionTwo={true} />}
      />
      <Route
        path="/foundation-programme"
        element={<FoundationLandingPage />}
      />
      <Route
        path="/apply_now/clat"
        element={<Clatlandingpage />}
      />
      <Route
        path="/apply_now/allindia/pmo"
        element={<PmoLandingPage />}
      />
      <Route
        path="/apply_now/allindia/pmtse"
        element={<PmtseLandingPage />}
      />
      <Route
        path="/pmo"
        element={<PmoLandingPage />}
      />
      <Route
        path="/pmtse"
        element={<PmtseLandingPage />}
      />
      <Route
        path="/apply_now/pntse"
        element={<PmtseLandingPage />}
      />
      <Route
        path="/apply_now/pais"
        element={<PmtseLandingPage />}
      />
      <Route
        path="/apply_now/scholarship"
        element={<PmtseLandingPage />}
      />
      <Route
        path="/apply_now/allindia/pntse"
        element={<PmtseLandingPage />}
      />
      <Route
        path="/apply_now/allindia/pais"
        element={<PmtseLandingPage />}
      />
      <Route
        path="/pntse"
        element={<PmtseLandingPage />}
      />
      <Route
        path="/anthe"
        element={<Paislandingpage />}
      />
      <Route
        path="/icici-demo"
        element={<ICICIPaymentDemo />}
      />

      {/* PNTSE / PAIS Portal & Exam Routes */}
      <Route path="/pntse/login" element={<PaisLogin />} />
      <Route path="/pais/login" element={<PaisLogin />} />
      <Route path="/anthe/login" element={<PaisLogin />} />
      <Route path="/pntse/dashboard" element={<PaisDashboard />} />
      <Route path="/pais/dashboard" element={<PaisDashboard />} />
      <Route path="/pntse/exam/instructions" element={<PaisExamEngine />} />
      <Route path="/pais/exam/instructions" element={<PaisExamEngine />} />
      <Route path="/pntse/exam/take" element={<PaisExamEngine />} />
      <Route path="/pais/exam/take" element={<PaisExamEngine />} />
      <Route
        path="/business/admin/pntse"
        element={
          <AdminProtectedRoute requiredPermission="manage_ads_leads">
            <AdminLayout>
              <PaisAdminManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/pais"
        element={
          <AdminProtectedRoute requiredPermission="manage_ads_leads">
            <AdminLayout>
              <PaisAdminManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Shiksha Bandhu Referral Partner System Routes */}
      <Route path="/shiksha-bandhu" element={<ShikshaBandhuLogin />} />
      <Route path="/shiksha-bandhu/login" element={<ShikshaBandhuLogin />} />
      <Route path="/shiksha-bandhu/dashboard" element={<ShikshaBandhuDashboard />} />
      <Route path="/shiksha-bandhu/mock-tests" element={<ShikshaBandhuMockTests />} />
      <Route path="/shiksha-bandhu/referrals" element={<ShikshaBandhuReferrals />} />
      <Route path="/shiksha-bandhu/earnings" element={<ShikshaBandhuEarnings />} />
      <Route path="/shiksha-bandhu/profile" element={<ShikshaBandhuProfile />} />
      <Route path="/sb/:referralId" element={<PublicReferralLanding />} />
      <Route path="/sb/:referralId/:programSlug" element={<PublicReferralLanding />} />

      {/* Protected Student Routes with Main Layout */}
      <Route
        path="/buynow"
        element={
          <MainLayout>
            <Buynow />
          </MainLayout>
        }
      />
      <Route
        path="/payment-status"
        element={
          <MainLayout>
            <PaymentStatus />
          </MainLayout>
        }
      />
      <Route
        path="/mocktests"
        element={
          <MainLayout>
            <MockTests />
          </MainLayout>
        }
      />

      {/* Admin Auth Routes (No Layout - they have their own styling) */}
      <Route path="/business/admin/login" element={<AdminLogin />} />
      <Route path="/business/admin/forgot-password" element={<AdminForgotPassword />} />
      <Route path="/business/admin/reset-password" element={<AdminResetPassword />} />
      <Route
        path="/business/admin/register/:token"
        element={<AdminRegisterWithInvite />}
      />

      {/* Protected Admin Routes with Admin Layout */}
      <Route
        path="/business/admin/dashboard"
        element={
          <AdminProtectedRoute requiredPermission="view_dashboard">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Mock Tests Management Route */}
      <Route
        path="/business/admin/mocktests"
        element={
          <AdminProtectedRoute requiredPermission="manage_mocktests">
            <AdminLayout>
              <MockTestsManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Counselling Bookings Route */}
      <Route
        path="/business/admin/counselling-bookings"
        element={
          <AdminProtectedRoute requiredPermission="manage_counselling_bookings">
            <AdminLayout>
              <CounsellingBookingsList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Courses Routes */}
      <Route
        path="/business/admin/courses"
        element={
          <AdminProtectedRoute requiredPermission="manage_courses">
            <AdminLayout>
              <CourseList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/courses/create"
        element={
          <AdminProtectedRoute requiredPermission="manage_courses">
            <AdminLayout>
              <CourseCreate />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/courses/:id/edit"
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
        path="/business/admin/centres"
        element={
          <AdminProtectedRoute requiredPermission="manage_centres">
            <AdminLayout>
              <CentreList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/centres/create"
        element={
          <AdminProtectedRoute requiredPermission="manage_centres">
            <AdminLayout>
              <CentreCreate />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/centres/:id/edit"
        element={
          <AdminProtectedRoute requiredPermission="manage_centres">
            <AdminLayout>
              <CentreEdit />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Job Management Routes - ADD THESE */}
      <Route
        path="/business/admin/jobs"
        element={
          <AdminProtectedRoute requiredPermission="manage_jobs">
            <AdminLayout>
              <JobManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/jobs/create"
        element={
          <AdminProtectedRoute requiredPermission="manage_jobs">
            <AdminLayout>
              <JobPostForm />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/jobs/edit/:id"
        element={
          <AdminProtectedRoute requiredPermission="manage_jobs">
            <AdminLayout>
              <JobPostForm />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/applications"
        element={
          <AdminProtectedRoute requiredPermission="manage_jobs">
            <AdminLayout>
              <JobApplicationList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/course-applications"
        element={
          <AdminProtectedRoute requiredPermission="manage_applications">
            <AdminLayout>
              <ApplicantsList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/ads-leads"
        element={
          <AdminProtectedRoute requiredPermission="manage_ads_leads">
            <AdminLayout>
              <AdsLeadsList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/shiksha-hub"
        element={
          <AdminProtectedRoute requiredPermission="manage_ads_leads">
            <AdminLayout>
              <ShikshaHubManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/shiksha-products"
        element={
          <AdminProtectedRoute requiredPermission="manage_ads_leads">
            <AdminLayout>
              <ShikshaProductsManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/business/admin/franchise-inquiries"
        element={
          <AdminProtectedRoute requiredPermission="manage_franchise">
            <AdminLayout>
              <FranchiseInquiryList />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Alumni Management */}
      <Route
        path="/business/admin/alumni"
        element={
          <AdminProtectedRoute requiredPermission="manage_alumni">
            <AdminLayout>
              <AlumniManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Student Corner Management */}
      <Route
        path="/business/admin/student-corner"
        element={
          <AdminProtectedRoute requiredPermission="manage_student_corner">
            <AdminLayout>
              <StudentCornerManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/business/admin/blog"
        element={
          <AdminProtectedRoute requiredPermission="manage_blogs">
            <AdminLayout>
              <BlogManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/business/admin/announcements"
        element={
          <AdminProtectedRoute requiredPermission="manage_announcements">
            <AdminLayout>
              <AnnouncementManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/business/admin/wbjee-analysis"
        element={
          <AdminProtectedRoute requiredPermission="manage_wbjee_analysis">
            <AdminLayout>
              <WBJEEAnalysisManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/neet-analysis"
        element={
          <AdminProtectedRoute requiredPermission="manage_neet_analysis">
            <AdminLayout>
              <NEETAnalysisManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/business/admin/jee-analysis"
        element={
          <AdminProtectedRoute requiredPermission="manage_jee_analysis">
            <AdminLayout>
              <JEEAnalysisManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/business/admin/popups"
        element={
          <AdminProtectedRoute requiredPermission="manage_popups">
            <AdminLayout>
              <PopupManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      <Route
        path="/business/admin/custom-pages"
        element={
          <AdminProtectedRoute requiredPermission="manage_custom_pages">
            <AdminLayout>
              <CustomPagesManagement />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />

      {/* Users Management */}
      <Route
        path="/business/admin/users"
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
        path="/business/admin/management"
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
        path="/business/admin/settings"
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
        path="/business/admin"
        element={<Navigate to="/business/admin/dashboard" replace />}
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

      <Route
        path="/pais"
        element={<Pais />}
      />

      {/* Legal Pages */}
      <Route
        path="/terms-and-conditions"
        element={
          <MainLayout>
            <TermsAndConditions />
          </MainLayout>
        }
      />
      <Route
        path="/privacy-policy"
        element={
          <MainLayout>
            <PrivacyPolicy />
          </MainLayout>
        }
      />
      <Route
        path="/cancellation-policy"
        element={
          <MainLayout>
            <CancellationPolicy />
          </MainLayout>
        }
      />
      <Route
        path="/refund-policy"
        element={
          <MainLayout>
            <RefundPolicy />
          </MainLayout>
        }
      />

      {/* Dynamic CMS Custom Pages */}
      <Route
        path="/:slug"
        element={
          <MainLayout>
            <CustomPageRenderer />
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
    </Suspense>
  );
};

export default AppRoutes;


