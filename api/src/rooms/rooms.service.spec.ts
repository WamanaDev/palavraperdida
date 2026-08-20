import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  RoomsService,
  shuffle,
  sorterWords,
  sorterTeamWords,
} from './rooms.service';
import { WORDS } from './words';

describe('RoomsService', () => {
  let service: RoomsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsService],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a room owned by the given nickname', () => {
      const room = service.create({ nickname: 'Alice' });
      expect(room.owner).toBe('Alice');
      expect(room.status).toBe('AGUARDANDO');
      expect(room.players).toEqual([]);
    });

    it('returns the existing room when the same nickname creates again', () => {
      const first = service.create({ nickname: 'Bob' });
      const second = service.create({ nickname: 'Bob' });
      expect(second).toBe(first);
    });
  });

  describe('findOne', () => {
    it('returns the room for a valid slug', () => {
      const created = service.create({ nickname: 'Carol' });
      expect(service.findOne(created.slug)).toBe(created);
    });

    it('throws NotFoundException for an unknown slug', () => {
      expect(() => service.findOne('slug-que-nao-existe')).toThrow(
        NotFoundException,
      );
    });
  });

  describe('startGame', () => {
    it('sets status to EM_JOGO and assigns words to the room', () => {
      const room = service.create({ nickname: 'Dave' });
      service.startGame(room.slug);
      expect(room.status).toBe('EM_JOGO');
      expect(room.words?.BURRO).toHaveLength(9);
      expect(room.words?.JUMENTO).toHaveLength(8);
    });

    it('throws NotFoundException for an unknown slug', () => {
      expect(() => service.startGame('slug-que-nao-existe')).toThrow(
        NotFoundException,
      );
    });

    it('falls back to the full word list when words is an empty array', () => {
      const room = service.create({ nickname: 'Eve' });
      service.startGame(room.slug, []);
      expect(room.status).toBe('EM_JOGO');
      expect(room.words?.BURRO).toHaveLength(9);
      expect(room.words?.JUMENTO).toHaveLength(8);
    });
  });
});

describe('shuffle', () => {
  it('keeps the same elements, possibly in a different order', () => {
    const original = [1, 2, 3, 4, 5];
    const result = shuffle(original);
    expect(result).toHaveLength(original.length);
    expect([...result].sort()).toEqual([...original].sort());
  });

  it('does not mutate the original array', () => {
    const original = [1, 2, 3];
    shuffle(original);
    expect(original).toEqual([1, 2, 3]);
  });
});

describe('sorterWords', () => {
  it('returns exactly 25 words', () => {
    expect(sorterWords(WORDS)).toHaveLength(25);
  });

  it('never repeats a word', () => {
    const result = sorterWords(WORDS);
    expect(new Set(result).size).toBe(25);
  });

  it('only returns words that were in the original list', () => {
    const result = sorterWords(WORDS);
    result.forEach((word) => expect(WORDS).toContain(word));
  });
});

describe('sorterTeamWords', () => {
  const twentyFiveWords = WORDS.slice(0, 25);

  it('splits words into 9/8/7/1 based on teamStart', () => {
    const result = sorterTeamWords(twentyFiveWords, 'BURRO');
    expect(result.BURRO).toHaveLength(9);
    expect(result.JUMENTO).toHaveLength(8);
    expect(result.white).toHaveLength(7);
    expect(result.black).toHaveLength(1);
  });

  it('gives the starting team 9 words regardless of which team starts', () => {
    const result = sorterTeamWords(twentyFiveWords, 'JUMENTO');
    expect(result.JUMENTO).toHaveLength(9);
    expect(result.BURRO).toHaveLength(8);
  });

  it('assigns every word exactly once, with no duplicates or omissions', () => {
    const result = sorterTeamWords(twentyFiveWords, 'BURRO');
    const allAssigned = [
      ...result.BURRO,
      ...result.JUMENTO,
      ...result.white,
      ...result.black,
    ];
    expect(allAssigned.sort()).toEqual([...twentyFiveWords].sort());
  });
});
