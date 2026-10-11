import { useState } from "react";

import {
  HiOutlineArrowRight,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
} from "react-icons/hi2";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";

import { registerUser } from "../services/api";

function getErrorMessage(error) {
  if (!error.response) {
    return "Cannot connect to the Acely server. Make sure Spring Boot is running on port 8080.";
  }

  const data =
    error.response.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.error) {
    return data.error;
  }

  if (data?.details) {
    return data.details;
  }

  return `Registration failed (${error.response.status}).`;
}

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const fields = [
    {
      key: "name",
      label: "Full name",
      type: "text",
      icon: HiOutlineUser,
      placeholder: "Your name",
      autoComplete: "name",
    },
    {
      key: "email",
      label: "Email address",
      type: "email",
      icon: HiOutlineEnvelope,
      placeholder: "you@example.com",
      autoComplete: "email",
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      icon: HiOutlineLockClosed,
      placeholder: "At least 6 characters",
      autoComplete: "new-password",
    },
  ];

  const submit = async (
    event
  ) => {
    event.preventDefault();

    setError("");

    const name =
      form.name.trim();

    const email =
      form.email.trim();

    if (
      !name ||
      !email ||
      !form.password
    ) {
      setError(
        "Please complete all fields."
      );

      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await registerUser({
          name,
          email,
          password:
            form.password,
        });

      console.log(
        "REGISTER RESPONSE:",
        response
      );

      if (!response?.token) {
        throw new Error(
          "Registration succeeded but the server did not return a token."
        );
      }

      localStorage.setItem(
        "acely_token",
        response.token
      );

      localStorage.setItem(
        "acely_user",
        JSON.stringify({
          userId:
            response.userId,
          name:
            response.name,
          email:
            response.email,
          role:
            response.role,
        })
      );

      localStorage.removeItem(
        "acely_document_id"
      );

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      setError(
        error.message ||
          getErrorMessage(error)
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Build a smarter study system in just a few moments."
      footer={
        <>
          <span>
            Already have an account?
          </span>{" "}
          <Link
            to="/login"
            className="font-semibold text-brand"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        onSubmit={submit}
        className="mt-7 space-y-4"
      >
        {fields.map(
          ({
            key,
            label,
            type,
            icon: Icon,
            placeholder,
            autoComplete,
          }) => (
            <label
              key={key}
              className="block text-sm font-semibold text-slate-700"
            >
              {label}

              <div className="relative mt-1.5">
                <Icon className="absolute left-3 top-3 size-5 text-slate-400" />

                <input
                  value={
                    form[key]
                  }
                  onChange={(
                    event
                  ) =>
                    setForm({
                      ...form,
                      [key]:
                        event.target
                          .value,
                    })
                  }
                  type={type}
                  placeholder={
                    placeholder
                  }
                  autoComplete={
                    autoComplete
                  }
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 outline-none ring-brand focus:ring-2"
                />
              </div>
            </label>
          )
        )}

        {error && (
          <p className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-600">
            {error}
          </p>
        )}

        <Button
          type="submit"
          className="w-full py-3"
          disabled={loading}
        >
          {loading
            ? "Creating account..."
            : "Create account"}

          {!loading && (
            <HiOutlineArrowRight />
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Register;