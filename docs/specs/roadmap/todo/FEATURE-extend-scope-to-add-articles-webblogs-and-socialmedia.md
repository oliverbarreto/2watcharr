# Task: Extend scope to add articles, webblogs and socialmedia

## Description

i am considering to extend the scope of the app to also include storing information about , not only youtube videos and podcast episodes, but also be able to save web articles to read, blogposts, and also social media posts (twitter, linkedin, etc.) ... i want you to analyze how to go about it, the impact in the architecture, the data model, and the representation in the UI.

---

Notes to consdier before implementation:
- change the model to have items, do not resue episodes for that. We need to take a step back, go above and abstract the concept of "content" to a more generic one, and then have episodes, articles, blogposts, socialmedia posts as sub-types of that generic concept. 
- Refactor the whole app to support this new model. 