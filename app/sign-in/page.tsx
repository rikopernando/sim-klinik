import "./sign-in.css"
import { BrandPanel } from "./brand-panel"
import { SignInForm } from "./sign-in-form"

export default function SignInPage() {
  return (
    <div className="sk-root">
      <BrandPanel />
      <SignInForm />
    </div>
  )
}
