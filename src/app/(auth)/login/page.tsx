import { Button } from "@/components/ui/button";

function Login() {
  return (
    <div>
      <div>Login</div>
      <input type="text" className="border border-gray-300 rounded p-2" />
      <input type="password" className="border border-gray-300 rounded p-2" />
      <Button>Entrar</Button>
    </div>
  );
}

export default Login;
