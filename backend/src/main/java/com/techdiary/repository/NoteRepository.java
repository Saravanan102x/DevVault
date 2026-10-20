package com.techdiary.repository;

import com.techdiary.model.Note;
import java.util.List;

public interface NoteRepository extends CrudRepository<Note, String> {
    List<Note> findByFolder(String folder);
    List<Note> findByTag(String tag);
    List<Note> search(String query);
    List<Note> findFavourites();
    List<Note> findPinned();
    List<Note> findNeedingRevision();
}
