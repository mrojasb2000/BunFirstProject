import { object, pipe, string, minLength, type InferInput } from "valibot";

export const CharacterSchema = object({
  name: pipe(string(), minLength(6)),
  lastName: pipe(string(), minLength(6)),
});

export type Character = InferInput<typeof CharacterSchema> & {
  id: number;
};

const characters: Map<number, Character> = new Map();

/**
 * Get all characters.
 *
 * @returns {Character[]} - The list of characters.
 */
export const getAllCharacters = (): Character[] => {
  return Array.from(characters.values());
};

/**
 * Get a character by id.
 *
 * @param {number} id - The id of the character.
 * @returns {Character | undefined} - The character if found, otherwise undefined.
 */
export const getCharacterById = (id: number): Character | undefined => {
  return characters.get(id);
};

/**
 * Add a new character with the given name and lastName.
 *
 * @param {Character} character - The name of the character.
 * @returns {Character} - The added character.
 */
export const addCharacter = (character: Character): Character => {
  var unix = Math.round(+new Date() / 1000);
  const newCharacter: Character = {
    ...character,
    id: unix,
  };
  characters.set(unix, newCharacter);
  return newCharacter;
};

/**
 * Update a character by id.
 *
 * @param {number} id - The id of the character.
 * @param {Character} updatedCharacter - The updated character.
 * @returns {Character | null} - The updated character if found, otherwise undefined.
 */
export const updateCharacter = (
  id: number,
  updatedCharacter: Character,
): Character | null => {
  if (!characters.get(id)) {
    return null;
  }
  characters.set(id, updatedCharacter);
  return updatedCharacter;
};

/**
 * Delete a character by id.
 *
 * @param {number} id - The id of the character.
 * @returns {boolean} - True if the character was deleted, otherwise false.
 */
export const deleteCharacter = (id: number): boolean => {
  if (!characters.get(id)) {
    return false;
  }
  return characters.delete(id);
};
