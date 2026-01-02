import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import ProtectRoute from "components/routes/ProtectRoute";
import api_service from "./api/api_service";

import SignIn from "views/auth/SignIn";
import Dashboard from "views/admin/default";
import Lessons from "views/admin/lesson";
import Stagges from "views/admin/stagges";
import Quizzes from "views/admin/quizzes";
import Questions from "views/admin/questions";
import Category from "views/admin/category";
import Users from "views/admin/users";
import CreateLesson from "views/admin/lesson/create";
import EditLesson from "views/admin/lesson/edit";
import Logs from "views/admin/log";
import Reports from "views/admin/reports";
import Broadcast from "views/admin/broadcast";

const App = () => {
  const authme = async () => {
    try {
      const res = await api_service.get("/auth/me");
      localStorage.setItem("token", res.data.token);
    } catch (er) {
      console.log(er);
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      authme();
    }
  }, []);

  return (
    <Routes>
      <Route
        path="auth/sign-in"
        element={<AuthLayout children={<SignIn />} />}
      />
      <Route path="admin">
        <Route
          path="dashboard"
          element={
            <ProtectRoute
              children={
                <AdminLayout current="Dashboard" children={<Dashboard />} />
              }
            />
          }
        />
        <Route
          path="lesson"
          element={
            <ProtectRoute
              children={
                <AdminLayout current="Lessons" children={<Lessons />} />
              }
            />
          }
        />
        <Route
          path="/admin/lesson/create"
          element={
            <ProtectRoute
              children={
                <AdminLayout
                  current="Lesson / Create"
                  children={<CreateLesson />}
                />
              }
            />
          }
        />
        <Route
          path="/admin/lesson/edit/:id"
          element={
            <ProtectRoute
              children={
                <AdminLayout
                  current="Lesson / Edit"
                  children={<EditLesson />}
                />
              }
            />
          }
        />
        <Route
          path="stagges"
          element={
            <ProtectRoute
              children={
                <AdminLayout current="Stagges" children={<Stagges />} />
              }
            />
          }
        />
        <Route
          path="quizzes"
          element={
            <ProtectRoute
              children={
                <AdminLayout current="Quizzes" children={<Quizzes />} />
              }
            />
          }
        />
        <Route
          path="questions"
          element={
            <ProtectRoute
              children={
                <AdminLayout current="Questions" children={<Questions />} />
              }
            />
          }
        />
        <Route
          path="logs"
          element={
            <ProtectRoute
              children={<AdminLayout current="Logs" children={<Logs />} />}
            />
          }
        />
        <Route
          path="category"
          element={
            <ProtectRoute
              children={
                <AdminLayout current="Category" children={<Category />} />
              }
            />
          }
        />
        <Route
          path="reports"
          element={
            <ProtectRoute
              children={
                <AdminLayout current="Reports" children={<Reports />} />
              }
            />
          }
        />
        <Route
          path="broadcast"
          element={
            <ProtectRoute
              children={
                <AdminLayout current="Broadcast" children={<Broadcast />} />
              }
            />
          }
        />
        <Route
          path="users"
          element={
            <ProtectRoute
              children={<AdminLayout current="Users" children={<Users />} />}
            />
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default App;
