import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room } from './entities/room.entity';
import { randomInt } from 'crypto';
import { WORDS } from './words';
import type { CreateRoomDto } from './dto/create-room.dto';

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
  constructor() {
    this.create({ nickname: 'WamanaDev' });
    this.create({ nickname: 'WamanaDev2' });
  }
  create(createRoomDto: CreateRoomDto): Room {
    const findOwner = Array.from(this.rooms.values()).find(
      (room) => room.owner === createRoomDto.nickname,
    );
    if (findOwner) throw new ConflictException(findOwner);
    let slug = generateSlug();
    let attempts = 1;

    while (this.rooms.has(slug) && attempts < MAX_SLUG_ATTEMPTS) {
      slug = generateSlug();
      attempts++;
    }

    if (this.rooms.has(slug)) {
      throw new Error('Não foi possível gerar um slug único para a sala.');
    }

    const room: Room = {
      slug,
      createdAt: new Date(),
      players: [],
      status: 'AGUARDANDO',
      owner: createRoomDto.nickname,
    };
    this.rooms.set(slug, room);

    return room;
  }

  findAll() {
    const allRooms: Record<string, any> = {};

    this.rooms.forEach((val) => {
      allRooms[val.slug] = {
        slug: val.slug,
        playerCount: val.players.length,
        createdAt: val.createdAt,
        owner: val.owner,
        status: val.status,
      };
    });
    return allRooms;
  }

  findOne(slug: string) {
    const room = this.rooms.get(slug);
    if (!room) throw new NotFoundException(`Sala "${slug}" não encontrada.`);

    return room;
  }

  update(slug: string, updateRoomDto: UpdateRoomDto) {
    console.log(updateRoomDto);
    return `This action updates a #${slug} room`;
  }

  remove(slug: string) {
    return `This action removes a #${slug} room`;
  }
}
