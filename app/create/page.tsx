"use client";

import { useState } from "react";

export default function CreatePage() {
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [status, setStatus] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Reading both public profiles…");
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkedin, instagram })
    });
    const data = await res.json();
    setStatus(data.message || (res.ok ? "Agent created." : "Could not create agent."));
  }

  return <main className="section">
    <div className="eyebrow">Live ingestion</div>
    <h2>Create a dating agent</h2>
    <p className="muted">Exactly two sources: one public LinkedIn profile and one public Instagram profile.</p>
    <form className="card form" onSubmit={submit}>
      <label>LinkedIn public profile</label>
      <input className="input" value={linkedin} onChange={e=>setLinkedin(e.target.value)} placeholder="https://www.linkedin.com/in/..." required />
      <label>Instagram public profile</label>
      <input className="input" value={instagram} onChange={e=>setInstagram(e.target.value)} placeholder="https://www.instagram.com/..." required />
      <button className="btn" type="submit">Create agent</button>
      {status && <p className="muted">{status}</p>}
    </form>
  </main>;
}
