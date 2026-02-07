export function activateSection(id) {
  document.body.style.overflowY = "auto";
  const section = document.getElementById(id);
  section.classList.add("active");
  section.scrollIntoView({ behavior: "smooth" });
}