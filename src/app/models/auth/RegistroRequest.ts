import Rol from "./Rol";


export default interface RegistroRequest {
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol:string
}
