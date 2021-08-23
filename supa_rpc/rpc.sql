--rpc : rekap_buku_perkategori
CREATE OR REPLACE FUNCTION rekap_buku_perkategori()
 RETURNS TABLE(nama varchar, total_buku bigint)
 LANGUAGE sql
AS $function$
 	SELECT kategori_buku.nama, COUNT(buku.id) AS total_buku
	FROM buku
	JOIN kategori_buku ON buku.kategori_id = kategori_buku.id
	GROUP BY kategori_buku.nama
	ORDER BY kategori_buku.nama;
$function$;	

--rpc : detil_peminjaman
CREATE OR REPLACE FUNCTION detil_peminjaman(tanggal_pinjam_mulai_filter date, tanggal_pinjam_akhir_filter date, nama_anggota_filter varchar, petugas_id_filter int)
 RETURNS TABLE(tanggal_pinjam date, tanggal_batas_kembali date, nama_anggota varchar, nama_petugas varchar)
 LANGUAGE sql
AS $function$
 	SELECT peminjaman.tanggal_pinjam, peminjaman.tanggal_batas_kembali, anggota.nama AS nama_anggota, petugas.nama AS nama_petugas
	FROM peminjaman
	JOIN anggota ON peminjaman.nim = anggota.nim
	JOIN petugas ON peminjaman.petugas_id = petugas.id
	WHERE peminjaman.tanggal_pinjam >= tanggal_pinjam_mulai_filter
	AND peminjaman.tanggal_pinjam <= tanggal_pinjam_akhir_filter
	AND CASE WHEN nama_anggota_filter != '' THEN anggota.nama ILIKE '%'||nama_anggota_filter||'%' ELSE anggota.nama != '' END
	AND CASE WHEN petugas_id_filter is not null THEN peminjaman.petugas_id = petugas_id_filter ELSE peminjaman.petugas_id is not null END
	ORDER BY anggota.nama;
$function$;	


--rpc : rekap_peminjaman_harian
CREATE OR REPLACE FUNCTION rekap_peminjaman()
  	returns TABLE (tanggal_pinjam date, total_pinjam bigint) AS
$func$
 	select tanggal_pinjam, count(id) AS total_pinjam
	from peminjaman 
	group by tanggal_pinjam
$func$ LANGUAGE sql;