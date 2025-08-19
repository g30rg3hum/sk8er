import { login, signup } from "@/app/login/actions";

export default function LoginForm() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />

      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />

      <button formAction={login} className="border">
        Log in
      </button>
      <button formAction={signup} className="border">
        Sign up
      </button>
    </form>
  );
}
