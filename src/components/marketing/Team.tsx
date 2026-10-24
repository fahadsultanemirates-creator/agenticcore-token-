import { SectionHeading } from "@/components/marketing/Tokenomics";
const TEAM = [["Forge","Brand leader"],["Maya","Your first contact"],["Atlas","Technology"],["Nova","Creative"],["Leo","Marketing"],["Iris","Operations"],["Ledger","Finance preparation"],["Sage","Research"],["Orion","Quality"],["Amara","Office setup"]];
export default function Team() {
 return <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8" id="team">
 <SectionHeading eyebrow="The shared AgenticCore team" title="Familiar faces across the family." subtitle="Maya is your guide here. Meet the same team across our business sites and digital office." />
 <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-5">{TEAM.map(([name,role],i)=><article key={name} className="card-surface rounded-2xl p-3">
 <div role="img" aria-label={name + ", illustrated AI character"} style={{height:160,backgroundImage:"url(https://agenticcore.group/assets/team.png)",backgroundSize:"500% auto",backgroundPosition:`${(i%5)*25}% ${i<5?23:91}%`,backgroundRepeat:"no-repeat",borderRadius:12}} />
 <h3 className="mt-3 font-bold text-foreground">{name}</h3><p className="text-xs text-ac-muted">{role}</p></article>)}</div>
 <p className="mt-6 text-sm text-ac-muted">Forge leads the brand. Direct Forge chat is available to clients with an active office package in the Group workspace. AI characters represent team roles; the shared execution framework is still planned.</p>
 <a href="https://agenticcore.group/services.html" className="mt-5 inline-block font-semibold text-ac-lime hover:underline">Explore the digital office ↗</a>
 </section>;
}
