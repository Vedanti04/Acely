import FeaturePage from "../components/FeaturePage";
import StickyCard from "../components/StickyCard";
function Settings() { return <FeaturePage eyebrow="Account" title="Settings" description="Manage your learning preferences. Settings are currently a UI-only preview."><div className="mt-8 grid gap-5 md:grid-cols-2"><StickyCard color="purple"><h2 className="text-xl font-black">Learning preferences</h2><p className="mt-3 text-sm">Set daily targets, revision reminders, and preferred study sessions.</p></StickyCard><StickyCard color="yellow"><h2 className="text-xl font-black">Notifications</h2><p className="mt-3 text-sm">Get friendly reminders when flashcards and quizzes are ready.</p></StickyCard></div></FeaturePage>; }
export default Settings;
