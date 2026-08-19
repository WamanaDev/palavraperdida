import { Injectable } from '@nestjs/common';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import { randomInt } from 'crypto';
import { WORDS } from './words';

const SUFFIX_CHATS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const SUFFIX_LENGTH = 4;
const MAX_SLUG_ATTEMPTS = 10;

function normalizeForSlug(word: string): string {
  return word
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function randomSuffix(): string {
  let suffix = '';
  for (let i = 0; i < SUFFIX_LENGTH; i++) {
    suffix += SUFFIX_CHATS[randomInt(SUFFIX_CHATS.length)];
  }
  return suffix;
}

function pickTwoRandomWord(): [string, string] {
  const first = WORDS[randomInt(WORDS.length)];
  let second = WORDS[randomInt(WORDS.length)];
  while (second === first) {
    second = WORDS[randomInt(WORDS.length)];
  }

  return [first, second];
}

function generateSlug(): string {
  const [first, second] = pickTwoRandomWord();
  return `${normalizeForSlug(first)}-${normalizeForSlug(second)}-${randomSuffix()}`;
}

@Injectable()
export class RoomsService {
  private readonly rooms = new Map<string, Room>();

  create(): Room {
    let slug = generateSlug();
    let attempts = 1;

    while (this.rooms.has(slug) && attempts < MAX_SLUG_ATTEMPTS) {
      slug = generateSlug();
      attempts++;
    }

    if (this.rooms.has(slug)) {
      throw new Error('Não foi possível gerar um slug único para a sala.');
    }

    const room: Room = { slug, createdAt: new Date(), players: [] };
    this.rooms.set(slug, room);

    return room;
  }

  findAll() {
    return `This action returns all rooms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} room`;
  }

  update(id: number, updateRoomDto: UpdateRoomDto) {
    console.log(updateRoomDto);
    return `This action updates a #${id} room`;
  }

  remove(id: number) {
    return `This action removes a #${id} room`;
  }
}
