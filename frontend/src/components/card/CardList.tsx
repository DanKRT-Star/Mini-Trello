import type { Card } from '@/types/card';
import CardItem from './CardItem';

interface CardListProps {
  cards: Card[];
  boardId: string;
  onCardUpdated?: () => void;
}

export default function CardList({ cards, boardId, onCardUpdated }: CardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          boardId={boardId}
          onCardUpdated={onCardUpdated}
        />
      ))}
    </div>
  );
}