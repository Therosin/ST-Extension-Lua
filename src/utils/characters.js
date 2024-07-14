// Copyright (C) 2024 Theros <https://github.com/therosin>
// 
// This file is part of ST-Extension-Lua.
// 
// ST-Extension-Lua is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// ST-Extension-Lua is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with ST-Extension-Lua.  If not, see <https://www.gnu.org/licenses/>.
// @ts-nocheck
// eslint-disable-next-line no-unused-vars
/* global SillyTavern */
const context = SillyTavern.getContext();

export const getCharacterId = () => {
    let characterId = context.characterId;
    // When peeking a group chat member, find a proper characterId
    if (context.groupId) {
        const avatarUrlInput = document.getElementById('avatar_url_pole');
        if (avatarUrlInput instanceof HTMLInputElement) {
            const avatarUrl = avatarUrlInput.value;
            characterId = context.characters.findIndex(c => c.avatar === avatarUrl);
        }
    }
    return characterId;
}

export const getCharacterIdFromAvatarUrl = (avatarUrl) => {
    return context.characters.findIndex(c => c.avatar === avatarUrl);
}