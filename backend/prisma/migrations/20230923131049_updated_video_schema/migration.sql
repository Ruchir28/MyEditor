-- CreateTable
CREATE TABLE "_videoViewers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_videoViewers_AB_unique" ON "_videoViewers"("A", "B");

-- CreateIndex
CREATE INDEX "_videoViewers_B_index" ON "_videoViewers"("B");

-- AddForeignKey
ALTER TABLE "_videoViewers" ADD CONSTRAINT "_videoViewers_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_videoViewers" ADD CONSTRAINT "_videoViewers_B_fkey" FOREIGN KEY ("B") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
