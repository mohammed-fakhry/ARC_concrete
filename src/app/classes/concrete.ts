import { ConcreteMaterial } from './concrete-material';

export class Concrete {
  id!: string;
  name: string = '';
  lastUpdated: string = '';
  materials: ConcreteMaterial[] = [];

  constructor(concreteMaterial?: ConcreteMaterial[]) {
    this.materials = concreteMaterial ?? [];
  }
}
