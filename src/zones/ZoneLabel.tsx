import { Item } from '../canvas/Item';
import type { ZoneLabel as ZoneLabelContent } from '../content/types';

export function ZoneLabel({ title, subtitle, ...placement }: ZoneLabelContent) {
  return (
    <Item as="h2" className="zone-label" {...placement}>
      {title}
      <small>{subtitle}</small>
    </Item>
  );
}
