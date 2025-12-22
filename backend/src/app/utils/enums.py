from enum import Enum

class DifficultyLevel(str, Enum):
    beginner = "Beginner"
    intermediate = "Intermediate"
    advanced = "Advanced"

class ResourceType(str, Enum):
    course = "course"
    project = "project"
    book = "book"
    article_blog = "article_blog"
    video_talk = "video_talk"

RESOURCE_TYPE_LABELS = {
    ResourceType.course: "Course",
    ResourceType.project: "Project",
    ResourceType.book: "Book",
    ResourceType.article_blog: "Article & Blog",
    ResourceType.video_talk: "Video & Talk",
}
