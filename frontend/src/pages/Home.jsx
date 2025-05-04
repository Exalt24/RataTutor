import { Link } from 'react-router-dom'
export default function Home() {
  return (
    <div className="p-8">
      <h1>Welcome!</h1>
      <Link to="/login" className="text-blue-500">Log In</Link>
    </div>
  )
}
